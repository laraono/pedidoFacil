import { DataSource, Repository } from "typeorm";
import { Usuario } from "../database/entities/Usuario.js";

export class UsuarioRepository extends Repository<Usuario>{

    constructor(dataSource: DataSource) {
        super(Usuario, dataSource.createEntityManager());
    }

    async criarUsuario(nome: string, email: string, cpf: string, senha: string) {
        return await this.save({nome, email, cpf, senha})
    }

    async buscarUsuario(email: string) {
        return await this.findOneBy({email})
    }
}