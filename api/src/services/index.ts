import { estabelecimentoRepository, usuarioRepository } from "../repositories/index.js";
import { EstabelecimentoService } from "./EstabelecimentoService.js";
import { UsuarioService } from "./UsuarioService.js";

export const estabelecimentoService = new EstabelecimentoService(estabelecimentoRepository)
export const usuarioService = new UsuarioService(usuarioRepository)
