import bcrypt from 'bcrypt'
import { DataSource } from 'typeorm'
import { Establishment, Role, User } from '../database'
import { Admin } from '../database/entity/Admin'
import { LoginDTO, RegisterDTO } from '../dto'
import { UserStatus } from '../enum'
import { AppError } from '../middleware'
import { RefreshTokenRepository, UserRepository } from '../repository'
import { hashToken, gerarTokens, gerarTokenAdmin } from '../config/crypto'

// Hash dummy para manter tempo constante quando e-mail não existe (evita timing attack)
const DUMMY_HASH = '$2b$12$eImiTXuWVxfM37uY4JANjQev3nHN.SBuNFa5UPSmKUVgwjBiCXhHu'

export class AuthService {

    constructor(
        private dataSource: DataSource,
        private userRepository: UserRepository,
        private refreshTokenRepository: RefreshTokenRepository
    ) {}

    async register(data: RegisterDTO) {
        // --- Validações de unicidade ---
        const emailExiste = await this.userRepository.findOne({ where: { email: data.email } })
        if (emailExiste) throw new AppError('Este e-mail já está cadastrado.', 409)

        const cnpjExiste = await this.dataSource.getRepository(Establishment).findOne({ where: { cnpj: data.cnpj } })
        if (cnpjExiste) throw new AppError('Este CNPJ já está cadastrado.', 409)

        const savedUser = await this.dataSource.transaction(async (tx) => {
            const establishment = tx.create(Establishment, {
                name: data.nome_estabelecimento,
                cnpj: data.cnpj
            })
            const savedEstablishment = await tx.save(Establishment, establishment)

            const managerRole = tx.create(Role, {
                establishment: savedEstablishment,
                name: 'Gerente',
                permissions: JSON.stringify([
                    'RELATORIOS', 'COZINHA', 'CARDAPIO', 'FUNCIONARIOS', 'CONFIGURACAO',
                    'ASSINATURA', 'CRIAR_PEDIDO', 'NOTIFICACOES', 'CAIXA',
                    'COMANDAS_FINALIZADAS', 'CUPONS', 'NOTA_FISCAL'
                ])
            })
            const savedRole = await tx.save(Role, managerRole)

            // Cargos extras escolhidos no onboarding
            if (data.cargos?.length) {
                for (const cargo of data.cargos) {
                    const extraRole = tx.create(Role, {
                        establishment: savedEstablishment,
                        name: cargo.nome,
                        permissions: JSON.stringify(cargo.permissoes)
                    })
                    await tx.save(Role, extraRole)
                }
            }

            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(data.senha, salt)

            const user = tx.create(User, {
                establishment: savedEstablishment,
                role: savedRole,
                name: data.nome_usuario,
                email: data.email,
                password: passwordHash,
                status: UserStatus.ATIVA
            })
            const savedUser = await tx.save(User, user)

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
      if (user.status !== UserStatus.ATIVO) throw new AppError('Esta conta foi desativada.', 403);

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
      where: { id: decoded.id, status: UserStatus.ATIVO },
      relations: { establishment: true, role: true },
    });

    if (!user) {
      throw new AppError('Usuário inválido ou desativado.', 403);
    }

        const { accessToken, refreshToken } = await gerarTokens(user, this.refreshTokenRepository)

        return { accessToken, refreshToken, usuario: { id: user.id, nome: user.name, email: user.email } }
    }

    async logout(tokenStr: string) {
        const hash = hashToken(tokenStr)
        const tokenEntity = await this.refreshTokenRepository.findByHash(hash)

        if (!tokenEntity) {
            throw new AppError('Refresh token inválido.', 403)
        }

        await this.refreshTokenRepository.revokeByHash(hash)
        return null
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
      relations: { role: true, establishment: true },
    });

    if (!user) throw new AppError('Credenciais inválidas ou usuário inativo.', 401);

    return {
      usuario: { id: user.id, nome: user.name, email: user.email, status: user.status },
      cargo: user.role ? { id: user.role.id, nome: user.role.name, permissoes: user.role.permissions } : null,
      estabelecimentoId: user.establishment?.id ?? null,
    };
  }
}