const NUVEM_FISCAL_BASE_URL = 'https://api.sandbox.nuvemfiscal.com.br';
const NUVEM_FISCAL_AUTH_URL = 'https://auth.sandbox.nuvemfiscal.com.br/oauth/token';

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

interface SincronizarEmpresaInput {
    cnpj: string;
    razaoSocial: string;
    address: string;
    inscricaoMunicipalPath?: string;
    empresaIdExistente?: string;
}

export class NuvemFiscalService {
    private tokenCache: NuvemFiscalToken | null = null;

    constructor(
        private clientId: string = process.env.NUVEM_FISCAL_CLIENT_ID!,
        private clientSecret: string = process.env.NUVEM_FISCAL_CLIENT_SECRET!
    ) {}

    private async getAccessToken(): Promise<string> {
        const now = Date.now();

        if (this.tokenCache && this.tokenCache.expires_at > now + 30_000) {
            return this.tokenCache.access_token;
        }

        const body = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: this.clientId,
            client_secret: this.clientSecret,
            scope: 'nfe cnpj',
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

    async sincronizarEmpresa(input: SincronizarEmpresaInput): Promise<string | null> {
        const cnpjLimpo = input.cnpj.replace(/\D/g, '');

        const partes = input.address.split(',').map(s => s.trim());
        const logradouro = partes[0] ?? input.address;
        const numero = partes[1]?.split('-')[0]?.trim() ?? 'S/N';
        const bairro = partes[1]?.split('-')[1]?.trim() ?? 'Centro';
        const cidadeUF = partes[2]?.split('-') ?? [];
        const municipio = cidadeUF[0]?.trim() ?? 'Não informado';
        const uf = cidadeUF[1]?.trim()?.slice(0, 2) ?? 'SP';
        const cep = partes[3]?.replace(/\D/g, '') ?? '00000000';

        const payload = {
            cpf_cnpj: cnpjLimpo,
            inscricao_municipal: input.inscricaoMunicipalPath ? '000000' : undefined,
            nome_razao_social: input.razaoSocial,
            nome_fantasia: input.razaoSocial,
            fone: '',
            email: '',
            endereco: {
                logradouro,
                numero,
                bairro,
                codigo_municipio_ibge: '',
                cidade: municipio,
                uf,
                cep: cep.padStart(8, '0'),
            },
            optante_simples_nacional: false,
        };

        if (input.empresaIdExistente) {
            try {
                const updated = await this.request<any>('PUT', `/empresas/${cnpjLimpo}`, payload);
                return updated?.cpf_cnpj ? cnpjLimpo : input.empresaIdExistente;
            } catch {
            }
        }

        const empresa = await this.request<any>('POST', '/empresas', payload);
        return empresa?.cpf_cnpj ?? cnpjLimpo;
    }

    async emitirNFe(
        cnpjEmitente: string,
        totalValue: number,
        cpfCnpjDestinatario?: string,
        itens?: NFeItemInput[]
    ): Promise<NFeEmitidaResult> {
        const cnpjLimpo = cnpjEmitente.replace(/\D/g, '');

        const itensFinal = itens?.length
            ? itens
            : [
                  {
                      descricao: 'Venda de produtos/serviços',
                      quantidade: 1,
                      valorUnitario: totalValue,
                      ncm: '22021000',
                      cfop: '5102',
                  },
              ];

        const payload = this.buildNFePayload(cnpjLimpo, totalValue, cpfCnpjDestinatario, itensFinal);

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
        totalValue: number,
        cpfCnpjDestinatario?: string,
        itens: NFeItemInput[] = []
    ): object {
        const destinatario = cpfCnpjDestinatario
            ? {
                  cpf_cnpj: cpfCnpjDestinatario.replace(/\D/g, ''),
                  nome: 'CONSUMIDOR',
                  indicador_inscricao_estadual: 9,
              }
            : {
                  nome: 'CONSUMIDOR NÃO IDENTIFICADO',
                  indicador_inscricao_estadual: 9,
              };

        return {
            ambiente: 'homologacao',
            serie: '1',
            tipo: 'saida',
            finalidade: 'normal',
            natureza_operacao: 'VENDA DE MERCADORIA',
            emitente: {
                cpf_cnpj: cnpj,
            },
            destinatario,
            itens: itens.map((item, idx) => ({
                numero: idx + 1,
                codigo: `PROD-${String(idx + 1).padStart(4, '0')}`,
                descricao: item.descricao,
                ncm: item.ncm ?? '22021000',
                cfop: item.cfop ?? '5102',
                unidade_comercial: 'UN',
                quantidade_comercial: item.quantidade,
                valor_unitario_comercial: item.valorUnitario,
                valor_bruto: item.quantidade * item.valorUnitario,
                inclui_no_total: true,
                tributacao: {
                    icms: { origem: 0, cst: '41' },
                    pis: { cst: '07' },
                    cofins: { cst: '07' },
                },
            })),
            cobranca: {
                duplicatas: [
                    {
                        numero: '001',
                        vencimento: new Date().toISOString().split('T')[0],
                        valor: totalValue,
                    },
                ],
            },
        };
    }
}

export const nuvemFiscalService = new NuvemFiscalService();