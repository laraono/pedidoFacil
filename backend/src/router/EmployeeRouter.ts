import { Router } from 'express';
import { employeeController } from '../controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';
import { subscriptionMiddleware } from '../middleware';
import { validateRequest } from '../middleware/validateRequest';
import { createEmployeeSchema } from '../dto/employee/CreateEmployeeDTO';
import { updateEmployeeSchema } from '../dto/employee/UpdateEmployeeDTO';

const employeeRouter = Router();

employeeRouter.use(authenticate);
employeeRouter.use(subscriptionMiddleware);

employeeRouter.get(
  '/',
  checkPermission('FUNCIONARIOS'),
  employeeController.list,
);

employeeRouter.get(
  '/inactive',
  checkPermission('FUNCIONARIOS'),
  employeeController.listInactive,
);

employeeRouter.post(
  '/',
  checkPermission('FUNCIONARIOS'),
  validateRequest(createEmployeeSchema),
  employeeController.create,
);

employeeRouter.put(
  '/:id',
  checkPermission('FUNCIONARIOS'),
  validateRequest(updateEmployeeSchema),
  employeeController.update,
);

employeeRouter.delete(
  '/:id',
  checkPermission('FUNCIONARIOS'),
  employeeController.delete,
);

employeeRouter.patch(
  '/:id/reactivate',
  checkPermission('FUNCIONARIOS'),
  employeeController.reactivate,
);

employeeRouter.delete(
  '/:id/permanent',
  checkPermission('FUNCIONARIOS'),
  employeeController.permanentDelete,
);

export { employeeRouter };
