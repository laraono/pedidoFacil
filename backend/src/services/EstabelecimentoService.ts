import { EstabelecimentoRepository } from "../repositories/EstabelecimentoRepository"

export class EstabelecimentoService {

    private estabelecimentoRepository: EstabelecimentoRepository

    constructor(estabelecimentoRepository: EstabelecimentoRepository) {
        this.estabelecimentoRepository = estabelecimentoRepository
    }
    
    async criarEstabelecimento(nomeEstabelecimento: string, tipoAtendimento: string, cnpj: string) {
        if(tipoAtendimento !== 'Autoatendimento' && tipoAtendimento !== 'Garcom' && tipoAtendimento !== 'Hibrido') {
            console.log("throw error ver depois")
        }

        await this.estabelecimentoRepository.criarEstabelecimento(nomeEstabelecimento, tipoAtendimento, cnpj)
    }
}