import { AppDataSource } from '../database/data-source'
import { User } from '../database/entity/User'
import { Role } from '../database/entity/Role'
import { AppError } from '../middleware/error/AppError'
import { UserStatus } from '../enum'

export class EmployeeService {
    private userRepository = AppDataSource.getRepository(User)
    private roleRepository = AppDataSource.getRepository(Role)

    async createEmployee(establishmentId: number, data: Partial<User>, roleId: number) {
        const role = await this.roleRepository.findOne({
            where: { id: roleId, establishment: { id: establishmentId } }
        })

        if (!role) {
            throw new AppError('Cargo inválido para este estabelecimento', 400)
        }

        const existingUser = await this.userRepository.findOne({ where: { email: data.email } })
        if (existingUser) {
            throw new AppError('E-mail já está em uso', 400)
        }

        const employee = this.userRepository.create({
            ...data,
            status: UserStatus.ATIVA, 
            role: role,
            establishment: { id: establishmentId }
        })

        return await this.userRepository.save(employee)
    }

    async getEmployeesByEstablishment(establishmentId: number) {
        return await this.userRepository.find({
            where: { establishment: { id: establishmentId } },
            relations: ['role'],
            select: ['id', 'name', 'email', 'status', 'role']
        })
    }

    async softDeleteEmployee(employeeId: number, establishmentId: number) {
        const employee = await this.userRepository.findOne({
            where: { id: employeeId, establishment: { id: establishmentId } }
        })

        if (!employee) {
            throw new AppError('Funcionário não encontrado', 404)
        }

        await this.userRepository.softRemove(employee)
        return { message: 'Funcionário desativado com sucesso' }
    }
}