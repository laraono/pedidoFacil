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
  checkPermission('USUARIO_VIEW', 'ALL'),
  employeeController.list,
);

employeeRouter.get(
  '/inactive',
  checkPermission('USUARIO_VIEW', 'ALL'),
  employeeController.listInactive,
);

employeeRouter.post(
  '/',
  checkPermission('USUARIO_CREATE', 'ALL'),
  validateRequest(createEmployeeSchema), 
  employeeController.create,
);

employeeRouter.put(
  '/:id',
  checkPermission('USUARIO_EDIT', 'ALL'),
  validateRequest(updateEmployeeSchema), 
  employeeController.update,
);

employeeRouter.delete(
  '/:id',
  checkPermission('USUARIO_DELETE', 'ALL'),
  employeeController.delete,
);

employeeRouter.patch(
  '/:id/reactivate',
  checkPermission('USUARIO_EDIT', 'ALL'),
  employeeController.reactivate,
);

export { employeeRouter };