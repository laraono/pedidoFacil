const NUVEM_FISCAL_BASE_URL = 'https://api.sandbox.nuvemfiscal.com.br';
const NUVEM_FISCAL_AUTH_URL = 'https://auth.nuvemfiscal.com.br/oauth/token';

interface NuvemFiscalToken {
    access_token: string;
    expires_at: number;
}

interface NFeEmitidaResult {
    id: string;
    numero: string;
    codigoRetorno: string;
    mensagemRetorno: string;
    urlDanfe: string | null;
    status: 'autorizada' | 'erro' | 'pendente';
}

interface NFeItemInput {
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    ncm?: string;
    cfop?: string;
}

export class NuvemFiscalService {
    private tokenCache: NuvemFiscalToken | null = null;
    private empresaSetupCache = new Set<string>();

    constructor(
        private clientId?: string,
        private clientSecret?: string
    ) {}

    private async getAccessToken(): Promise<string> {
        const now = Date.now();

        if (this.tokenCache && this.tokenCache.expires_at > now + 30_000) {
            return this.tokenCache.access_token;
        }

        const clientId = this.clientId ?? process.env.NUVEM_FISCAL_CLIENT_ID;
        const clientSecret = this.clientSecret ?? process.env.NUVEM_FISCAL_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            throw new Error('Credenciais da Nuvem Fiscal não configuradas (NUVEM_FISCAL_CLIENT_ID / NUVEM_FISCAL_CLIENT_SECRET).');
        }

        const body = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
            scope: 'nfe cnpj empresa',
        });

        const res = await fetch(NUVEM_FISCAL_AUTH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Nuvem Fiscal auth falhou: ${err}`);
        }

        const data = await res.json();

        this.tokenCache = {
            access_token: data.access_token,
            expires_at: now + data.expires_in * 1000,
        };

        return this.tokenCache.access_token;
    }

    private async request<T>(
        method: string,
        path: string,
        body?: object
    ): Promise<T> {
        const token = await this.getAccessToken();

        const res = await fetch(`${NUVEM_FISCAL_BASE_URL}${path}`, {
            method,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        const responseText = await res.text();

        if (!res.ok) {
            throw new Error(`Nuvem Fiscal API [${res.status}]: ${responseText}`);
        }

        return JSON.parse(responseText) as T;
    }

    private async garantirEmpresaCadastrada(cnpj: string, nome: string): Promise<void> {
        if (this.empresaSetupCache.has(cnpj)) return;

        // 1. Cadastrar empresa se não existir
        let empresaExiste = false;
        try {
            await this.request('GET', `/empresas/${cnpj}`);
            empresaExiste = true;
        } catch (err: any) {
            if (!err?.message?.includes('404')) throw err;
        }

        if (!empresaExiste) {
            await this.request('POST', '/empresas', {
                cpf_cnpj: cnpj,
                nome_razao_social: nome.toUpperCase().slice(0, 60),
                email: `nfe@${cnpj}.sandbox`,
                endereco: {
                    logradouro: 'RUA TESTE',
                    numero: '1',
                    bairro: 'CENTRO',
                    codigo_municipio: '3550308',
                    uf: 'SP',
                    cep: '01001000',
                },
            });
        }

        // 2. Cadastrar certificado se não existir
        let certExiste = false;
        try {
            await this.request('GET', `/empresas/${cnpj}/certificados`);
            certExiste = true;
        } catch (err: any) {
            if (!err?.message?.includes('404')) throw err;
        }

        if (!certExiste) {
            const certBase64 = process.env.NUVEM_FISCAL_CERT_BASE64;
            const certPassword = process.env.NUVEM_FISCAL_CERT_PASSWORD;

            if (!certBase64 || !certPassword) {
                throw new Error(
                    'Certificado digital não configurado. Defina NUVEM_FISCAL_CERT_BASE64 e NUVEM_FISCAL_CERT_PASSWORD no .env.'
                );
            }

            await this.request('POST', `/empresas/${cnpj}/certificados`, {
                certificado: certBase64,
                password: certPassword,
            });
        }

        // 3. Configurar ambiente NF-e (idempotente)
        await this.request('PUT', `/empresas/${cnpj}/nfe`, {
            ambiente: 'homologacao',
            CRT: 1,
        });

        this.empresaSetupCache.add(cnpj);
    }

    async emitirNFe(
        cnpjEmitente: string,
        emitNome: string,
        totalValue: number,
        cpfCnpjDestinatario?: string,
        itens?: NFeItemInput[]
    ): Promise<NFeEmitidaResult> {
        const cnpjLimpo = cnpjEmitente.replace(/\D/g, '');

        await this.garantirEmpresaCadastrada(cnpjLimpo, emitNome);

        const itensFinal = itens?.length
            ? itens
            : [
                  {
                      descricao: 'Venda de produtos/servicos',
                      quantidade: 1,
                      valorUnitario: totalValue,
                      ncm: '22021000',
                      cfop: '5102',
                  },
              ];

        const payload = this.buildNFePayload(cnpjLimpo, emitNome, totalValue, cpfCnpjDestinatario, itensFinal);

        const nfCriada = await this.request<any>('POST', '/nfe', payload);
        const nfId: string = nfCriada.id;

        await this.request<any>('POST', `/nfe/${nfId}/emitir`, {});

        return await this.consultarNFe(nfId);
    }

    async consultarNFe(nfId: string): Promise<NFeEmitidaResult> {
        const nf = await this.request<any>('GET', `/nfe/${nfId}`);
        return this.mapResponseToResult(nf);
    }

    async cancelarNFe(nfId: string, motivo: string = 'Cancelamento solicitado pelo emitente'): Promise<void> {
        await this.request('POST', `/nfe/${nfId}/cancelamento`, { justificativa: motivo });
    }

    private mapResponseToResult(nf: any): NFeEmitidaResult {
        const autorizacao = nf.autorizacao;
        const codigoRetorno = autorizacao?.codigo_status?.toString() ?? nf.status_sefaz ?? '';
        const mensagemRetorno = autorizacao?.motivo_status ?? nf.mensagem_sefaz ?? '';

        let status: NFeEmitidaResult['status'] = 'pendente';
        if (nf.status === 'autorizado') status = 'autorizada';
        else if (['rejeitado', 'erro', 'cancelado'].includes(nf.status)) status = 'erro';

        return {
            id: nf.id,
            numero: nf.numero?.toString() ?? '',
            codigoRetorno,
            mensagemRetorno,
            urlDanfe: nf.link_pdf ?? null,
            status,
        };
    }

    private buildNFePayload(
        cnpj: string,
        emitNome: string,
        totalValue: number,
        cpfCnpjDestinatario?: string,
        itens: NFeItemInput[] = []
    ): object {
        const now = new Date();
        const dhEmi = now.toISOString().slice(0, 19) + '-03:00';
        const vProd = Number(totalValue.toFixed(2));

        const dest = cpfCnpjDestinatario
            ? {
                CPF: cpfCnpjDestinatario.replace(/\D/g, '').slice(0, 11),
                xNome: 'CONSUMIDOR',
                indIEDest: 9,
            }
            : {
                CPF: '00000000191', // CPF genérico para consumidor não identificado
                xNome: 'CONSUMIDOR NAO IDENTIFICADO',
                indIEDest: 9,
            };

        const det = itens.map((item, idx) => ({
            nItem: idx + 1,
            prod: {
                cProd: `PROD-${String(idx + 1).padStart(4, '0')}`,
                cEAN: 'SEM GTIN',
                xProd: item.descricao,
                NCM: item.ncm ?? '22021000',
                CFOP: item.cfop ?? '5102',
                uCom: 'UN',
                qCom: item.quantidade,
                vUnCom: Number(item.valorUnitario.toFixed(2)),
                vProd: Number((item.quantidade * item.valorUnitario).toFixed(2)),
                cEANTrib: 'SEM GTIN',
                uTrib: 'UN',
                qTrib: item.quantidade,
                vUnTrib: Number(item.valorUnitario.toFixed(2)),
                indTot: 1,
            },
            imposto: {
                ICMS: { ICMS40: { orig: 0, CST: '41' } },
                PIS:    { PISNT: { CST: '07' } },
                COFINS: { COFINSNT: { CST: '07' } },
            },
        }));

        return {
            ambiente: 'homologacao',
            referencia: `REF-${Date.now()}`,
            infNFe: {
                versao: '4.00',
                ide: {
                    cUF: 35,         // SP
                    natOp: 'VENDA DE MERCADORIA',
                    mod: 55,
                    serie: 1,
                    nNF: Math.floor(Math.random() * 900000) + 100000,
                    dhEmi,
                    tpNF: 1,         // saída
                    idDest: 1,       // operação interna
                    cMunFG: 3550308, // São Paulo
                    tpImp: 1,
                    tpEmis: 1,
                    tpAmb: 2,        // homologação
                    finNFe: 1,
                    indFinal: 1,     // consumidor final
                    indPres: 1,      // presencial
                    procEmi: 0,
                    verProc: '1.0',
                },
                emit: {
                    CNPJ: cnpj,
                    xNome: emitNome.toUpperCase().slice(0, 60),
                    enderEmit: {
                        xLgr: 'RUA TESTE',
                        nro: '1',
                        xBairro: 'CENTRO',
                        cMun: 3550308,
                        xMun: 'SAO PAULO',
                        UF: 'SP',
                        CEP: '01001000',
                        cPais: 1058,
                        xPais: 'BRASIL',
                    },
                    CRT: 1, // Simples Nacional
                },
                dest,
                det,
                total: {
                    ICMSTot: {
                        vBC: 0,
                        vICMS: 0,
                        vICMSDeson: 0,
                        vFCP: 0,
                        vBCST: 0,
                        vST: 0,
                        vFCPST: 0,
                        vFCPSTRet: 0,
                        vProd,
                        vFrete: 0,
                        vSeg: 0,
                        vDesc: 0,
                        vII: 0,
                        vIPI: 0,
                        vIPIDevol: 0,
                        vPIS: 0,
                        vCOFINS: 0,
                        vOutro: 0,
                        vNF: vProd,
                    },
                },
                transp: { modFrete: 9 },
                pag: {
                    detPag: [{ tPag: '01', vPag: vProd }],
                },
            },
        };
    }
}

export const nuvemFiscalService = new NuvemFiscalService();