import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { DataSource } from 'typeorm';
import { Admin } from '../database/entity/Admin';
import { Configuration, Establishment, Plan, Role, Subscription, User } from '../database/entity';
import { LoginDTO } from '../dto/auth/';
import { RegisterCompleteDTO } from '../dto/auth/RegisterCompleteDTO';
import { UserStatus, SubscriptionStatus, ServiceType, allPermissions } from '../enum';
import { AppError } from '../middleware/error/AppError';
import { UserRepository, RefreshTokenRepository } from '../repository';
import { EstablishmentRepository } from '../repository/EstablishmentRepository';
import { gerarTokens, gerarTokenAdmin, hashToken } from '../config/crypto';
import { MercadoPagoService } from './MercadoPagoService';

function calcRefreshExpiry(): Date {
  const raw = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  const match = raw.match(/^(\d+)([dhm]?)$/);
  const value = match ? parseInt(match[1]) : 7;
  const unit = match?.[2] || 'd';
  const exp = new Date();
  if (unit === 'h') exp.setHours(exp.getHours() + value);
  else if (unit === 'm') exp.setMinutes(exp.getMinutes() + value);
  else exp.setDate(exp.getDate() + value);
  return exp;
}

const DUMMY_HASH = '$2b$12$eImiTXuWVxfM37uY4JANjQev3nHN.SBuNFa5UPSmKUVgwjBiCXhHu';

import { validarSenhaForte } from '../utils/passwordSchema';

export class AuthService {
  constructor(
    private dataSource: DataSource,
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private establishmentRepository: EstablishmentRepository,
    private mercadoPagoService: MercadoPagoService,
  ) {}

  /** Validação por step — só leitura, sem criação. */
  async checkEmailAvailable(email: string) {
    const exists = await this.userRepository.findOne({ where: { email } });
    if (exists) throw new AppError('Este e-mail está inválido ou já está em uso.', 409);
    return { available: true };
  }

  /** Validação por step — só leitura, sem criação. */
  async checkCpfAvailable(cpf: string) {
    const exists = await this.userRepository.findOne({ where: { cpf } });
    if (exists) throw new AppError('Este CPF já está em uso.', 409);
    return { available: true };
  }

  /**
   * Cadastro completo.
   * Toda a escrita no DB ocorre em uma única transação — rollback automático se qualquer etapa falhar.
   * Tokens são gerados fora da transação, após o commit.
   */
  async registerComplete(data: RegisterCompleteDTO) {
    const emailExiste = await this.userRepository.findOne({ where: { email: data.email } });
    if (emailExiste) throw new AppError('Este e-mail está inválido ou já está em uso.', 409);

    if (data.cpf) {
      const cpfExiste = await this.userRepository.findOne({ where: { cpf: data.cpf } });
      if (cpfExiste) throw new AppError('Este CPF já está em uso.', 409);
    }

    const cnpjExiste = await this.establishmentRepository.findByCnpj(data.establishment.cnpj);
    if (cnpjExiste) throw new AppError('Este CNPJ já está cadastrado.', 409);

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.senha, salt);

    const { userId, establishmentId, roleId, cargoPermissoes } =
      await this.dataSource.transaction(async (manager) => {
        const savedUser = await manager.save(User, {
          name: data.nome_usuario,
          email: data.email,
          password: passwordHash,
          status: UserStatus.ATIVO,
          cpf: data.cpf ?? null,
        });

        const savedEstablishment = await manager.save(Establishment, {
          name: data.establishment.name,
          cnpj: data.establishment.cnpj,
          manager: savedUser,
        });

        // Cargo Gerente com todas as permissões reais
        const savedManagerRole = await manager.save(Role, {
          name: 'Gerente',
          permissions: JSON.stringify(allPermissions),
          establishment: { id: savedEstablishment.id },
        });

        // Vínculo usuário → cargo Gerente
        await manager.update(User, savedUser.id, { role: { id: savedManagerRole.id } });

        if (data.roles && data.roles.length > 0) {
          await manager.save(
            Role,
            data.roles.map((r) => ({
              name: r.label,
              permissions: JSON.stringify(r.permissions),
              establishment: { id: savedEstablishment.id },
            }))
          );
        }

        if (data.hasTotem) {
          await manager.update(Establishment, savedEstablishment.id, {
            serviceTypes: JSON.stringify([ServiceType.AUTOATENDIMENTO]),
          });
        }

        await manager.save(Configuration, {
          establishment: { id: savedEstablishment.id },
          backgroundColor: '#F4F4F9',
          cardsColor: '#FFFFFF',
          buttonsColor: '#E85D5D',
          comandaLabel: 'Comanda',
          activeCateogryColor: '#E85D5D',
          textsColor: '#333333',
          buttonsTextColor: '#FFFFFF',
          fontFamily: 'Inter',
          allowObservations: true,
        });

        const plan = await manager.findOne(Plan, { where: { id: data.planId } });
        if (!plan) throw new AppError('Plano não encontrado.', 404);
        if (!plan.mercadoPagoId) throw new AppError('Plano não configurado no Mercado Pago.', 500);

        const cardToken = data.payment.cardToken;
        const payerEmail = data.payment.payerEmail;

        // Se o MP falhar, o throw causa rollback de tudo acima
        const mpSubscription = await this.mercadoPagoService.createSubscription({
          preapproval_plan_id: plan.mercadoPagoId,
          payer_email: payerEmail,
          card_token_id: cardToken,
          reason: plan.name,
          status: 'authorized',
        });

        const expirationDate = new Date();
        if (plan.frequency === 'anual') {
          expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        } else {
          expirationDate.setMonth(expirationDate.getMonth() + 1);
        }

        try {
          await manager.save(Subscription, {
            initialDate: new Date(),
            establishment: savedEstablishment,
            expirationDate,
            lastPayment: new Date(),
            status: SubscriptionStatus.PENDENTE,
            price: plan.price,
            plan,
            mercadoPagoId: mpSubscription.id,
          });
        } catch (err) {
          // MP criou o preapproval mas o save falhou — cancela para não deixar cobrança órfã
          await this.mercadoPagoService.cancelSubscription(mpSubscription.id);
          throw err;
        }

        return {
          userId: savedUser.id,
          establishmentId: savedEstablishment.id,
          roleId: savedManagerRole.id,
          cargoPermissoes: allPermissions,
        };
      });

    // Tokens gerados após o commit da transação
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { role: { establishment: true } },
    });
    if (!user) throw new AppError('Erro ao recuperar usuário após cadastro.', 500);

    const { accessToken, refreshToken } = await gerarTokens(user);
    await this.refreshTokenRepository.createToken(user, hashToken(refreshToken), calcRefreshExpiry());

    return {
      accessToken,
      refreshToken,
      usuario: { id: user.id, nome: user.name, email: user.email },
      cargo: { id: roleId, nome: 'Gerente', permissoes: cargoPermissoes },
      estabelecimentoId: establishmentId,
    };
  }

  async login(data: LoginDTO) {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
      relations: { role: { establishment: true } },
    });

    if (user) {
      if (user.status !== UserStatus.ATIVO) throw new AppError('Esta conta foi desativada.', 403);

      const senhaValida = await bcrypt.compare(data.senha, user.password);
      if (!senhaValida) throw new AppError('Credenciais inválidas.', 401);

      const { accessToken, refreshToken } = await gerarTokens(user);
      await this.refreshTokenRepository.createToken(user, hashToken(refreshToken), calcRefreshExpiry());

      return {
        accessToken,
        refreshToken,
        usuario: { id: user.id, nome: user.name, email: user.email, status: user.status },
        cargo: user.role ? { id: user.role.id, nome: user.role.name, permissoes: user.role.permissions } : null,
        estabelecimentoId: user.role?.establishment?.id ?? null,
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
    await this.refreshTokenRepository.createAdminToken(admin, hashToken(refreshToken), calcRefreshExpiry());

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

    const oldHash = hashToken(tokenStr);
    const storedToken = await this.refreshTokenRepository.findByHash(oldHash);
    if (!storedToken) throw new AppError('Refresh token inválido ou revogado.', 403);
    await this.refreshTokenRepository.revokeByHash(oldHash);

    if (decoded.isAdmin) {
      const admin = await this.dataSource.getRepository(Admin).findOne({ where: { id: decoded.id } });
      if (!admin) throw new AppError('Admin inválido.', 403);

      const { accessToken, refreshToken } = await gerarTokenAdmin(admin);
      await this.refreshTokenRepository.createAdminToken(admin, hashToken(refreshToken), calcRefreshExpiry());

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
      relations: { role: { establishment: true } },
    });

    if (!user) throw new AppError('Credenciais inválidas ou usuário inativo.', 403);

    const { accessToken, refreshToken } = await gerarTokens(user);
    await this.refreshTokenRepository.createToken(user, hashToken(refreshToken), calcRefreshExpiry());

    return {
      accessToken,
      refreshToken,
      usuario: { id: user.id, nome: user.name, email: user.email, status: user.status },
      cargo: user.role ? { id: user.role.id, nome: user.role.name, permissoes: user.role.permissions } : null,
      estabelecimentoId: user.role?.establishment?.id ?? null,
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
      relations: { role: { establishment: true } },
    });

    if (!user) throw new AppError('Usuário inválido.', 401);

    return {
      usuario: { ...user, isAdmin: false },
      cargo: user.role ? { id: user.role.id, nome: user.role.name, permissoes: user.role.permissions } : null,
      estabelecimentoId: user.role?.establishment?.id ?? null,
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
    const resetUrl = `${frontEndUrl}/reset-password?token=${resetToken}`;

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

  async resetPassword(token: string, novaSenha: string) {
    const senhaErro = validarSenhaForte(novaSenha);
    if (senhaErro) throw new AppError(senhaErro, 400);

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userRepository.findOne({
      where: { passwordResetToken: hashedToken }
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