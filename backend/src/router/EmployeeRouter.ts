import { Router } from 'express';
import { employeeController } from '../controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';
import { Permission } from '../enum';
import { subscriptionMiddleware } from '../middleware';
import { validateRequest } from '../middleware/validateRequest';
import { createEmployeeSchema } from '../dto/employee/CreateEmployeeDTO';
import { updateEmployeeSchema } from '../dto/employee/UpdateEmployeeDTO';

const employeeRouter = Router();

employeeRouter.use(authenticate);
employeeRouter.use(subscriptionMiddleware);

employeeRouter.get(
  '/',
  checkPermission(Permission.FUNCIONARIOS),
  employeeController.list,
);

employeeRouter.get(
  '/inactive',
  checkPermission(Permission.FUNCIONARIOS),
  employeeController.listInactive,
);

employeeRouter.post(
  '/',
  checkPermission(Permission.FUNCIONARIOS),
  validateRequest(createEmployeeSchema),
  employeeController.create,
);

employeeRouter.put(
  '/:id',
  checkPermission(Permission.FUNCIONARIOS),
  validateRequest(updateEmployeeSchema),
  employeeController.update,
);

employeeRouter.delete(
  '/:id',
  checkPermission(Permission.FUNCIONARIOS),
  employeeController.delete,
);

employeeRouter.patch(
  '/:id/reactivate',
  checkPermission(Permission.FUNCIONARIOS),
  employeeController.reactivate,
);

employeeRouter.delete(
  '/:id/permanent',
  checkPermission(Permission.FUNCIONARIOS),
  employeeController.permanentDelete,
);

export { employeeRouter };
