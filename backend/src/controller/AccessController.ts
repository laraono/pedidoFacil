import { Request, Response, NextFunction } from 'express'
import { RoleService } from '../service/RoleService'
import { EmployeeService } from '../service/EmployeeService'

const roleService = new RoleService()
const employeeService = new EmployeeService()

export class AccessController {

    async createRole(req: Request, res: Response, next: NextFunction) {
        try {
            const establishmentId = (req as any).usuario.estabelecimento
            const role = await roleService.createRole(establishmentId, req.body)
            return res.status(201).json(role)
        } catch (error) { next(error) }
    }

    async listRoles(req: Request, res: Response, next: NextFunction) {
        try {
            const establishmentId = (req as any).usuario.estabelecimento
            const roles = await roleService.getRolesByEstablishment(establishmentId)
            return res.status(200).json(roles)
        } catch (error) { next(error) }
    }

    async createEmployee(req: Request, res: Response, next: NextFunction) {
        try {
            const establishmentId = (req as any).usuario.estabelecimento
            
            // 👇 Agora mandamos o req.body inteiro, pois o roleId já está lá dentro!
            const employee = await employeeService.createEmployee(establishmentId, req.body)
            return res.status(201).json(employee)
        } catch (error) { next(error) }
    }

    async listEmployees(req: Request, res: Response, next: NextFunction) {
        try {
            const establishmentId = (req as any).usuario.estabelecimento
            
            const employees = await employeeService.listEmployees(establishmentId)
            return res.status(200).json(employees)
        } catch (error) { next(error) }
    }
}