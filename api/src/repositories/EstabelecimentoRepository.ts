import { DataSource, Repository } from "typeorm";
import { Estabelecimento } from "../database/entities/Estabelecimento.js";

export class EstabelecimentoRepository extends Repository<Estabelecimento> {

    constructor(dataSource: DataSource) {
        super(Estabelecimento, dataSource.createEntityManager());
    }

    async criarEstabelecimento(nomeEstabelecimento: string, tipoAtendimento: string, cnpj: string) {
        return this.save({nomeEstabelecimento, tipoAtendimento, cnpj})
    }
}