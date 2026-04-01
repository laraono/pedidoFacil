import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from '../service/EmployeeService';

const employeeService = new EmployeeService();

export class EmployeeController {
  
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const establishmentId = (req as any).usuario.estabelecimento;
      const employees = await employeeService.listEmployees(establishmentId);
      return res.json(employees);
    } catch (error) {
      next(error);
    }
  }

  async listInactive(req: Request, res: Response, next: NextFunction) {
    try {
      const establishmentId = (req as any).usuario.estabelecimento;
      const employees = await employeeService.listInactiveEmployees(establishmentId);
      return res.json(employees);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const establishmentId = (req as any).usuario.estabelecimento;
      const newEmployee = await employeeService.createEmployee(establishmentId, req.body);
      return res.status(201).json(newEmployee);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const establishmentId = (req as any).usuario.estabelecimento;
      const userId = Number(req.params.id);
      const updatedEmployee = await employeeService.updateEmployee(establishmentId, userId, req.body);
      return res.json(updatedEmployee);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const establishmentId = (req as any).usuario.estabelecimento;
      const userId = Number(req.params.id);
      const result = await employeeService.softDeleteEmployee(establishmentId, userId);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async reactivate(req: Request, res: Response, next: NextFunction) {
    try {
      const establishmentId = (req as any).usuario.estabelecimento;
      const userId = Number(req.params.id);
      const result = await employeeService.reactivateEmployee(establishmentId, userId);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}