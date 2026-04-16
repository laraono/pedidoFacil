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

            await tx.update(Establishment, savedEstablishment.id, { manager: savedUser })

            return savedUser
        })

        const { accessToken, refreshToken } = await gerarTokens(savedUser, this.refreshTokenRepository)

        return { accessToken, refreshToken, usuario: { id: savedUser.id, nome: savedUser.name, email: savedUser.email } }
    }

    async login(data: LoginDTO) {
        const user = await this.userRepository.findOne({
            where: { email: data.email, status: UserStatus.ATIVA },
            relations: { establishment: true, role: true }
        })

        if (user) {
            const senhaValida = await bcrypt.compare(data.senha, user.password)
            if (!senhaValida) throw new AppError('Credenciais inválidas.', 401)

            const { accessToken, refreshToken } = await gerarTokens(user, this.refreshTokenRepository)
            return { accessToken, refreshToken, usuario: { id: user.id, nome: user.name, email: user.email } }
        }

        // Fallback: verifica tabela de admins
        const admin = await this.dataSource.getRepository(Admin).findOne({ where: { email: data.email } })
        if (!admin) {
            await bcrypt.compare(data.senha, DUMMY_HASH)
            throw new AppError('Credenciais inválidas ou usuário inativo.', 401)
        }

        const senhaAdminValida = await bcrypt.compare(data.senha, admin.password)
        if (!senhaAdminValida) throw new AppError('Credenciais inválidas.', 401)

        const { accessToken, refreshToken } = await gerarTokenAdmin(admin, this.refreshTokenRepository)
        return { accessToken, refreshToken, usuario: { id: admin.id, nome: admin.name, email: admin.email } }
    }

    async refresh(tokenStr: string) {
        const hash = hashToken(tokenStr)
        const tokenEntity = await this.refreshTokenRepository.findByHash(hash)

        if (!tokenEntity) {
            throw new AppError('Refresh token inválido.', 403)
        }

        await this.refreshTokenRepository.revokeByHash(hash)

        if (tokenEntity.admin) {
            const admin = await this.dataSource.getRepository(Admin).findOne({ where: { id: tokenEntity.admin.id } })
            if (!admin) throw new AppError('Admin inválido.', 403)

            const { accessToken, refreshToken } = await gerarTokenAdmin(admin, this.refreshTokenRepository)
            return { accessToken, refreshToken, usuario: { id: admin.id, nome: admin.name, email: admin.email } }
        }

        const user = await this.userRepository.findOne({
            where: { id: tokenEntity.user!.id },
            relations: { establishment: true, role: true }
        })

        if (!user) {
            throw new AppError('Usuário inválido.', 403)
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
            const admin = await this.dataSource.getRepository(Admin).findOne({ where: { id: userId } })
            if (!admin) throw new AppError('Admin não encontrado.', 401)
            return {
                usuario: { id: admin.id, nome: admin.name, email: admin.email },
                cargo: { id: 0, nome: 'Admin', permissoes: ['ALL'] },
                estabelecimentoId: null
            }
        }

        const user = await this.userRepository.findOne({
            where: { id: userId, status: UserStatus.ATIVA },
            relations: { role: true, establishment: true }
        })

        if (!user) {
            throw new AppError('Credenciais inválidas ou usuário inativo.', 401)
        }

        return {
            usuario: { id: user.id, nome: user.name, email: user.email },
            cargo: {
                id: user.role.id,
                nome: user.role.name,
                permissoes: user.role.permissions
            },
            estabelecimentoId: user.establishment?.id ?? null
        }
    }
}
