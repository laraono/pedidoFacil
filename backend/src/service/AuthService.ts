import bcrypt from 'bcrypt'
import { DataSource } from 'typeorm'
import { Establishment, Role, User } from '../database'
import { Admin } from '../database/entity/Admin'
import { LoginDTO, RegisterDTO } from '../dto'
import { UserStatus } from '../enum'
import { AppError } from '../middleware'
import { RefreshTokenRepository, UserRepository } from '../repository'
import { hashToken, gerarTokens, gerarTokenAdmin } from '../config/crypto'

function validarCNPJ(cnpj: string): boolean {
    const c = cnpj.replace(/[^\d]/g, '')
    if (c.length !== 14 || /^(\d)\1{13}$/.test(c)) return false
    let sum = 0, pos = 5
    for (let i = 0; i < 12; i++) { sum += parseInt(c[i]) * pos--; if (pos < 2) pos = 9 }
    let r = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    if (r !== parseInt(c[12])) return false
    sum = 0; pos = 6
    for (let i = 0; i < 13; i++) { sum += parseInt(c[i]) * pos--; if (pos < 2) pos = 9 }
    r = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    return r === parseInt(c[13])
}

function validarSenhaForte(senha: string): string | null {
    if (senha.length < 8) return 'A senha deve ter pelo menos 8 caracteres.'
    if (!/[A-Z]/.test(senha)) return 'A senha deve conter pelo menos uma letra maiúscula.'
    if (!/[0-9]/.test(senha)) return 'A senha deve conter pelo menos um número.'
    if (!/[^A-Za-z0-9]/.test(senha)) return 'A senha deve conter pelo menos um caractere especial.'
    return null
}

export class AuthService {

    constructor(
        private dataSource: DataSource,
        private userRepository: UserRepository,
        private refreshTokenRepository: RefreshTokenRepository
    ) {}

    async register(data: RegisterDTO) {
        // --- Validações de formato ---
        if (!data.nome_usuario?.trim()) {
            throw new AppError('Nome do usuário é obrigatório.', 400)
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            throw new AppError('E-mail inválido.', 400)
        }
        if (!validarCNPJ(data.cnpj)) {
            throw new AppError('CNPJ inválido.', 400)
        }
        const senhaErro = validarSenhaForte(data.senha)
        if (senhaErro) throw new AppError(senhaErro, 400)

        // --- Validações de unicidade ---
        const emailExiste = await this.userRepository.findOne({ where: { email: data.email } })
        if (emailExiste) throw new AppError('Este e-mail já está cadastrado.', 409)

        const cnpjExiste = await this.dataSource.getRepository(Establishment).findOne({ where: { cnpj: data.cnpj } })
        if (cnpjExiste) throw new AppError('Este CNPJ já está cadastrado.', 409)

        const savedUser = await this.dataSource.transaction(async (manager) => {
            const establishment = manager.create(Establishment, {
                name: data.nome_estabelecimento,
                cnpj: data.cnpj
            })
            const savedEstablishment = await manager.save(Establishment, establishment)

            const managerRole = manager.create(Role, {
                establishment: savedEstablishment,
                name: 'Gerente',
                permissions: JSON.stringify([
                    'RELATORIOS', 'COZINHA', 'CARDAPIO', 'FUNCIONARIOS', 'CONFIGURACAO',
                    'ASSINATURA', 'CRIAR_PEDIDO', 'NOTIFICACOES', 'CAIXA',
                    'COMANDAS_FINALIZADAS', 'CUPONS', 'NOTA_FISCAL'
                ])
            })
            const savedRole = await manager.save(Role, managerRole)

            // Cargos extras escolhidos no onboarding
            if (data.cargos?.length) {
                for (const cargo of data.cargos) {
                    const extraRole = manager.create(Role, {
                        establishment: savedEstablishment,
                        name: cargo.nome,
                        permissions: JSON.stringify(cargo.permissoes)
                    })
                    await manager.save(Role, extraRole)
                }
            }

            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(data.senha, salt)

            const user = manager.create(User, {
                establishment: savedEstablishment,
                role: savedRole,
                name: data.nome_usuario,
                email: data.email,
                password: passwordHash,
                status: UserStatus.ATIVA
            })
            const savedUser = await manager.save(User, user)

            await manager.update(Establishment, savedEstablishment.id, { manager: savedUser })

            return savedUser
        })

        const { accessToken } = await gerarTokens(savedUser, this.refreshTokenRepository)

        return { accessToken, usuario: { id: savedUser.id, nome: savedUser.name, email: savedUser.email } }
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
        if (!admin) throw new AppError('Credenciais inválidas ou usuário inativo.', 401)

        const senhaAdminValida = await bcrypt.compare(data.senha, admin.password)
        if (!senhaAdminValida) throw new AppError('Credenciais inválidas.', 401)

        const { accessToken } = gerarTokenAdmin(admin)
        return { accessToken, refreshToken: null, usuario: { id: admin.id, nome: admin.name, email: admin.email } }
    }

    async refresh(tokenStr: string) {
        const hash = hashToken(tokenStr)
        const tokenEntity = await this.refreshTokenRepository.findByHash(hash)

        if (!tokenEntity) {
            throw new AppError('Refresh token inválido.', 403)
        }

        await this.refreshTokenRepository.revokeByHash(hash)

        const user = await this.userRepository.findOne({
            where: { id: tokenEntity.user.id },
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
