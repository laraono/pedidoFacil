import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { DataSource } from 'typeorm';
import { Admin } from '../database/entity/Admin';
import { LoginDTO } from '../dto';
import { UserStatus } from '../enum';
import { AppError } from '../middleware';
import { UserRepository } from '../repository';
import { gerarTokens, gerarTokenAdmin } from '../config/crypto';

const DUMMY_HASH = '$2b$12$eImiTXuWVxfM37uY4JANjQev3nHN.SBuNFa5UPSmKUVgwjBiCXhHu';

function validarSenhaForte(senha: string): string | null {
  if (senha.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
  if (!/[A-Z]/.test(senha)) return 'A senha deve conter pelo menos uma letra maiúscula.';
  if (!/[0-9]/.test(senha)) return 'A senha deve conter pelo menos um número.';
  if (!/[^A-Za-z0-9]/.test(senha)) return 'A senha deve conter pelo menos um caractere especial.';
  return null;
}

export class AuthService {
  constructor(
    private dataSource: DataSource,
    private userRepository: UserRepository
  ) {}

  async registerManager(data: { nome_usuario: string; email: string; senha: string; }) {
    if (!data.nome_usuario?.trim()) throw new AppError('Nome do usuário é obrigatório.', 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw new AppError('E-mail inválido.', 400);

    const senhaErro = validarSenhaForte(data.senha);
    if (senhaErro) throw new AppError(senhaErro, 400);

    const emailExiste = await this.userRepository.findOne({ where: { email: data.email } });
    if (emailExiste) throw new AppError('Este e-mail já está cadastrado.', 409);

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.senha, salt);

    const user = this.userRepository.create({
      name: data.nome_usuario,
      email: data.email,
      password: passwordHash,
      status: UserStatus.ATIVA,
    });

    const savedUser = await this.userRepository.save(user);

    const { accessToken, refreshToken } = await gerarTokens(savedUser);

    return { accessToken, refreshToken, usuario: { id: savedUser.id, nome: savedUser.name, email: savedUser.email } };
  }

  async login(data: LoginDTO) {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
      relations: { establishment: true, role: true },
    });

    if (user) {
      if (user.status !== UserStatus.ATIVA) throw new AppError('Esta conta foi desativada.', 403);

      const senhaValida = await bcrypt.compare(data.senha, user.password);
      if (!senhaValida) throw new AppError('Credenciais inválidas.', 401);

      const { accessToken, refreshToken } = await gerarTokens(user);
      
      return {
        accessToken, refreshToken,
        usuario: { id: user.id, nome: user.name, email: user.email, status: user.status },
        cargo: user.role ? { id: user.role.id, nome: user.role.name, permissoes: user.role.permissions } : null,
        estabelecimentoId: user.establishment?.id ?? null,
      };
    }

    const admin = await this.dataSource.getRepository(Admin).findOne({ where: { email: data.email } });
      
    if (!admin) {
      await bcrypt.compare(data.senha, DUMMY_HASH);
      throw new AppError('Credenciais inválidas.', 401);
    }

    const senhaAdminValida = await bcrypt.compare(data.senha, admin.password);
    if (!senhaAdminValida) throw new AppError('Credenciais inválidas.', 401);

    const { accessToken, refreshToken } = await gerarTokenAdmin(admin);
    
    return {
      accessToken, refreshToken,
      usuario: { id: admin.id, nome: admin.name, email: admin.email },
      cargo: { id: 0, nome: 'Admin', permissoes: ['ALL'] },
      estabelecimentoId: null,
    };
  }

  async refresh(tokenStr: string) {
    let decoded: any;
    try {
      decoded = jwt.verify(tokenStr, process.env.JWT_SECRET!);
    } catch (error) {
      throw new AppError('Refresh token inválido ou expirado.', 403);
    }

    if (!decoded.isRefresh) {
      throw new AppError('Token fornecido não é válido para esta operação.', 403);
    }

    if (decoded.isAdmin) {
      const admin = await this.dataSource.getRepository(Admin).findOne({ where: { id: decoded.id } });
      if (!admin) throw new AppError('Admin inválido.', 403);

      const { accessToken, refreshToken } = await gerarTokenAdmin(admin);
      return {
        accessToken, refreshToken,
        usuario: { id: admin.id, nome: admin.name, email: admin.email },
        cargo: { id: 0, nome: 'Admin', permissoes: ['ALL'] },
        estabelecimentoId: null,
      };
    }

    const user = await this.userRepository.findOne({
      where: { id: decoded.id, status: UserStatus.ATIVA },
      relations: { establishment: true, role: true },
    });

    if (!user) {
      throw new AppError('Usuário inválido ou desativado.', 403);
    }

    const { accessToken, refreshToken } = await gerarTokens(user);

    return {
      accessToken, refreshToken,
      usuario: { id: user.id, nome: user.name, email: user.email, status: user.status },
      cargo: user.role ? { id: user.role.id, nome: user.role.name, permissoes: user.role.permissions } : null,
      estabelecimentoId: user.establishment?.id ?? null,
    };
  }

  async logout() {
    return { message: 'Logout realizado com sucesso.' };
  }

  async perfil(userId: number, isAdmin = false) {
    if (isAdmin) {
      const admin = await this.dataSource.getRepository(Admin).findOne({ where: { id: userId } });
      if (!admin) throw new AppError('Admin não encontrado.', 401);
      return {
        usuario: { id: admin.id, nome: admin.name, email: admin.email },
        cargo: { id: 0, nome: 'Admin', permissoes: ['ALL'] },
        estabelecimentoId: null,
      };
    }

        const user = await this.userRepository.findOne({
            where: { id: userId, status: UserStatus.ATIVO },
            relations: { role: true, establishment: true }
        })

    if (!user) throw new AppError('Credenciais inválidas ou usuário inativo.', 401);

    return {
      usuario: { id: user.id, nome: user.name, email: user.email, status: user.status },
      cargo: user.role ? { id: user.role.id, nome: user.role.name, permissoes: user.role.permissions } : null,
      estabelecimentoId: user.establishment?.id ?? null,
    };
  }
}