import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { EstabelecimentoService } from '../services/EstabelecimentoService.js';
import { UsuarioService } from '../services/UsuarioService.js';
import { Request, Response } from 'express'
import { Usuario } from '../database/entities/Usuario.js';

export class AuthController {

    private estabelecimentoService: EstabelecimentoService
    private usuarioService: UsuarioService

    constructor(estabelecimentoService: EstabelecimentoService, usuarioService: UsuarioService) {
        this.estabelecimentoService = estabelecimentoService
        this.usuarioService = usuarioService
    }

    async registerManager(req: Request, res: Response) {
        const { nome, email, cpf, senha } = req.body
        const { nomeEstabelecimento, tipoAtendimento, cnpj } = req.body

        const idUsuario = await this.usuarioService.criarUsuario(nome, email, cpf, senha)
        const idEstabelecimento = await this.estabelecimentoService.criarEstabelecimento(nomeEstabelecimento, tipoAtendimento, cnpj)

        res.status(200).send({idUsuario, idEstabelecimento})

    }

    async login(req: Request, res: Response) {
        const { email, senha } = req.body

        const usuarioLogado = await this.usuarioService.logarUsuario(email, senha)

        if(usuarioLogado) {
            const token = this.gerarJWTToken(usuarioLogado)

            res.status(200).send(token)
        } else {
            res.sendStatus(401)
        }

    }

    gerarJWTToken(usuarioLogado: Usuario) {
        dotenv.config();

        const payload = { usuarioLogado };
        const secret = process.env.JWT_SECRET;

        if(!secret) {
            return
        }

        const token = jwt.sign(payload, secret, {
            expiresIn: '1d'
        });

        return token
    }

}