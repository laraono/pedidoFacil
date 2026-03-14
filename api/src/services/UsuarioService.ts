import sjcl from 'sjcl'

import { UsuarioRepository } from '../repositories/UsuarioRepository'

export class UsuarioService {

    private usuarioRepository: UsuarioRepository

    constructor(usuarioRepository: UsuarioRepository) {
        this.usuarioRepository = usuarioRepository
    }
    
    async criarUsuario(nome: string, email: string, cpf: string, senha: string) {

        const senhaCriptografada = this.criptografarSenha(senha)
        
        return await this.usuarioRepository.criarUsuario(nome, email, cpf, senhaCriptografada)
    }

    criptografarSenha(senha: string) {

        const senhaEmBytes = sjcl.hash.sha256.hash(senha)
        const senhaEmHash = sjcl.codec.hex.fromBits(senhaEmBytes)

        return senhaEmHash
    }

    async logarUsuario(email: string, senha: string) {
        const senhaCriptografada = this.criptografarSenha(senha)

        const usuario = await this.usuarioRepository.buscarUsuario(email)

        if(!usuario) {
            return
        }

        if(usuario.email === email && usuario.senha === senhaCriptografada) {

            return usuario

        }


    }
}