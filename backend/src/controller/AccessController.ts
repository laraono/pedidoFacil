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
            const { roleId, ...employeeData } = req.body
            
            const employee = await employeeService.createEmployee(establishmentId, employeeData, roleId)
            return res.status(201).json(employee)
        } catch (error) { next(error) }
    }

    async listEmployees(req: Request, res: Response, next: NextFunction) {
        try {
            const establishmentId = (req as any).usuario.estabelecimento
            const employees = await employeeService.getEmployeesByEstablishment(establishmentId)
            return res.status(200).json(employees)
        } catch (error) { next(error) }
    }
}