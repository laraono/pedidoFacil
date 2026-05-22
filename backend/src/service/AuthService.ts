import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { DataSource } from 'typeorm';
import { Admin } from '../database/entity/Admin';
import { LoginDTO, RegisterDTO } from '../dto/auth/';
import { UserStatus } from '../enum';
import { AppError } from '../middleware/error/AppError';
import { UserRepository, RefreshTokenRepository } from '../repository';
import { gerarTokens, gerarTokenAdmin, hashToken } from '../config/crypto';

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
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository, 
  ) {}

  async registerManager(data: RegisterDTO) {
    if (!data.nome_usuario?.trim()) throw new AppError('Nome do usuário é obrigatório.', 400);
    
    const senhaErro = validarSenhaForte(data.senha);
    if (senhaErro) throw new AppError(senhaErro, 400);

    const emailExiste = await this.userRepository.findOne({ where: { email: data.email } });
    if (emailExiste) throw new AppError('Este e-mail está inválido ou já está em uso.', 409);

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.senha, salt);

    const user = this.userRepository.create({
      name: data.nome_usuario,
      email: data.email,
      password: passwordHash,
      status: UserStatus.ATIVO,
      cpf: data.cpf ?? null,
    });

    const savedUser = await this.userRepository.save(user);
    const { accessToken, refreshToken } = await gerarTokens(savedUser);

    return { 
      accessToken, 
      refreshToken, 
      usuario: { id: savedUser.id, nome: savedUser.name, email: savedUser.email } 
    };
  }

  async login(data: LoginDTO) {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
      relations: { establishment: true, role: true },
    });

    if (user) {
      if (user.status !== UserStatus.ATIVO) throw new AppError('Esta conta foi desativada.', 403);

      const senhaValida = await bcrypt.compare(data.senha, user.password);
      if (!senhaValida) throw new AppError('Credenciais inválidas.', 401);

      const { accessToken, refreshToken } = await gerarTokens(user);
      
      return {
        accessToken, 
        refreshToken,
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
      accessToken, 
      refreshToken,
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
        accessToken, 
        refreshToken,
        usuario: { id: admin.id, nome: admin.name, email: admin.email },
        cargo: { id: 0, nome: 'Admin', permissoes: ['ALL'] },
        estabelecimentoId: null,
      };
    }

    const user = await this.userRepository.findOne({
      where: { id: decoded.id, status: UserStatus.ATIVO },
      relations: { establishment: true, role: true },
    });

    if (!user) {
      throw new AppError('Credenciais inválidas ou usuário inativo.', 403);
    }

    const { accessToken, refreshToken } = await gerarTokens(user);

    return {
      accessToken, 
      refreshToken,
      usuario: { id: user.id, nome: user.name, email: user.email, status: user.status },
      cargo: user.role ? { id: user.role.id, nome: user.role.name, permissoes: user.role.permissions } : null,
      estabelecimentoId: user.establishment?.id ?? null,
    };
  }

  async logout(tokenStr: string) {
    if (!tokenStr) return { message: 'Logout realizado com sucesso.' };

    const hash = hashToken(tokenStr);
    const tokenEntity = await this.refreshTokenRepository.findByHash(hash);

    if (tokenEntity) {
      await this.refreshTokenRepository.revokeByHash(hash);
    }

    return { message: 'Logout realizado com sucesso.' };
  }

  async perfil(userId: number, isAdmin = false) {
    if (isAdmin) {
      const admin = await this.dataSource.getRepository(Admin).findOne({ where: { id: userId } });
      if (!admin) throw new AppError('Admin não encontrado.', 401);
      return {
        usuario: { ...admin, isAdmin: true }, 
        cargo: { nome: 'Admin', permissoes: ['ALL'] },
        estabelecimentoId: null,
      };
    }

    const user = await this.userRepository.findOne({
      where: { id: userId, status: UserStatus.ATIVO },
      relations: { role: true, establishment: true },
    });

    if (!user) throw new AppError('Usuário inválido.', 401);

    return {
      usuario: { ...user, isAdmin: false }, 
      cargo: user.role ? { id: user.role.id, nome: user.role.name, permissoes: user.role.permissions } : null,
      estabelecimentoId: user.establishment?.id ?? null,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return { message: 'Se o e-mail existir, um link de recuperação será enviado.' };

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = expiresAt;
    await this.userRepository.save(user);

    const frontEndUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontEndUrl}/reset-password?token=${resetToken}&email=${user.email}`;

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"PedidoFácil" <${process.env.MAIL_USER}>`,
      to: user.email,
      subject: 'Recuperação de Senha',
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2>Olá, ${user.name}</h2>
          <p>Você solicitou a redefinição de sua senha. Clique no link abaixo:</p>
          <a href="${resetUrl}" style="background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Redefinir Senha</a>
          <p>Este link expira em 15 minutos.</p>
        </div>
      `
    });

    return { message: 'Se o e-mail existir, um link de recuperação será enviado.' };
  }

  async resetPassword(token: string, email: string, novaSenha: string) {
    const senhaErro = validarSenhaForte(novaSenha);
    if (senhaErro) throw new AppError(senhaErro, 400);

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userRepository.findOne({
      where: {
        email,
        passwordResetToken: hashedToken
      }
    });

    if (!user) throw new AppError('Token inválido ou expirado.', 400);
    if (user.passwordResetExpires && new Date() > user.passwordResetExpires) throw new AppError('Token expirado.', 400);

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(novaSenha, salt);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await this.userRepository.save(user);

    return { message: 'Senha redefinida com sucesso.' };
  }
}