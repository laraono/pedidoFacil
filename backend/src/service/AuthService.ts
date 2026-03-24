import bcrypt from 'bcrypt'
import { DataSource } from 'typeorm'
import { Establishment, Role, User } from '../database'
import { LoginDTO, RegisterDTO } from '../dto'
import { UserStatus } from '../enum'
import { AppError } from '../middleware'
import { RefreshTokenRepository, UserRepository } from '../repository'
import { hashToken, gerarTokens } from '../config/crypto'

export class AuthService {

    constructor(
        private dataSource: DataSource,
        private userRepository: UserRepository,
        private refreshTokenRepository: RefreshTokenRepository
    ) {}

    async register(data: RegisterDTO) {
        return await this.dataSource.transaction(async (manager) => {
            const establishment = manager.create(Establishment, {
                name: data.nome_estabelecimento,
                cnpj: data.cnpj
            })
            const savedEstablishment = await manager.save(Establishment, establishment)

            const role = manager.create(Role, {
                establishment: savedEstablishment,
                name: 'Gerente',
                permissions: JSON.stringify(['ALL'])
            })
            const savedRole = await manager.save(Role, role)

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

            const { accessToken } = await gerarTokens(savedUser, this.refreshTokenRepository)

            return { accessToken, usuario: { id: savedUser.id, nome: savedUser.name, email: savedUser.email } }
        })
    }

    async login(data: LoginDTO) {
        const user = await this.userRepository.findOne({
            where: { email: data.email, status: UserStatus.ATIVA },
            relations: { establishment: true, role: true }
        })

        if (!user) {
            throw new AppError('Credenciais inválidas ou usuário inativo.', 401)
        }

        const senhaValida = await bcrypt.compare(data.senha, user.password)
        if (!senhaValida) {
            throw new AppError('Credenciais inválidas.', 401)
        }

        const { accessToken, refreshToken } = await gerarTokens(user, this.refreshTokenRepository)

        return { accessToken, refreshToken, usuario: { id: user.id, nome: user.name, email: user.email } }
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

    async perfil(userId: number) {
        const user = await this.userRepository.findOne({
            where: { id: userId, status: UserStatus.ATIVA },
            relations: { role: true }
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
            }
        }
    }
}
