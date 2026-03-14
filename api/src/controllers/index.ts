import { estabelecimentoService, usuarioService } from "../services/index.js";
import { AuthController } from "./AuthController.js";

export const authController = new AuthController(estabelecimentoService, usuarioService)