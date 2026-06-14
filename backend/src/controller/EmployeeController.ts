import { Request, Response } from 'express';
import { EmployeeService } from '../service/EmployeeService';
import { catchAsync } from '../middleware/error/catchAsync';
import { auditLog } from '../utils/logger';
export class EmployeeController {

  constructor(private employeeService: EmployeeService) {}

  list = catchAsync(async (req: Request, res: Response) => {
    const establishmentId = (req as any).usuario.estabelecimento;
    return res.json(await this.employeeService.listEmployees(establishmentId, true));
  });

  listInactive = catchAsync(async (req: Request, res: Response) => {
    const establishmentId = (req as any).usuario.estabelecimento;
    return res.json(await this.employeeService.listEmployees(establishmentId, false));
  });

  create = catchAsync(async (req: Request, res: Response) => {
    const establishmentId = (req as any).usuario.estabelecimento;
    const newEmployee = await this.employeeService.createEmployee(establishmentId, req.body);
    auditLog('employee.created', { establishmentId, userId: newEmployee.id, ip: req.ip, timestamp: new Date().toISOString() });
    return res.status(201).json(newEmployee);
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const establishmentId = (req as any).usuario.estabelecimento;
    const userId = Number(req.params.id);
    const updatedEmployee = await this.employeeService.updateEmployee(establishmentId, userId, req.body);
    auditLog('employee.updated', { establishmentId, userId, ip: req.ip, timestamp: new Date().toISOString() });
    return res.json(updatedEmployee);
  });

  delete = catchAsync(async (req: Request, res: Response) => {
    const establishmentId = (req as any).usuario.estabelecimento;
    const userId = Number(req.params.id);
    const result = await this.employeeService.deactivateEmployee(establishmentId, userId);
    auditLog('employee.deactivated', { establishmentId, userId, ip: req.ip, timestamp: new Date().toISOString() });
    return res.json(result);
  });

  reactivate = catchAsync(async (req: Request, res: Response) => {
    const establishmentId = (req as any).usuario.estabelecimento;
    const userId = Number(req.params.id);
    const result = await this.employeeService.reactivateEmployee(establishmentId, userId);
    auditLog('employee.reactivated', { establishmentId, userId, ip: req.ip, timestamp: new Date().toISOString() });
    return res.json(result);
  });

  permanentDelete = catchAsync(async (req: Request, res: Response) => {
    const establishmentId = (req as any).usuario.estabelecimento;
    const userId = Number(req.params.id);
    const result = await this.employeeService.deleteEmployee(establishmentId, userId);
    auditLog('employee.deleted', { establishmentId, userId, ip: req.ip, timestamp: new Date().toISOString() });
    return res.json(result);
  });
}