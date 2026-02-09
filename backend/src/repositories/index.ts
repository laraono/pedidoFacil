import { EstabelecimentoRepository } from "./EstabelecimentoRepository.js";
import { UsuarioRepository } from "./UsuarioRepository.js";
import { AppDataSource } from "../database/data-source.js";

export const estabelecimentoRepository = new EstabelecimentoRepository(AppDataSource)
export const usuarioRepository = new UsuarioRepository(AppDataSource)