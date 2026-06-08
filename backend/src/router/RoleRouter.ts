import { Router } from 'express';
import { RoleController, roleLimiter } from '../controller/RoleController';
import { roleService } from '../service';
import { authenticate } from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';
import { subscriptionMiddleware } from '../middleware';
import { validateRequest } from '../middleware/validateRequest';
import { createRoleSchema } from '../dto/role/CreateRoleDTO';
import { updateRoleSchema } from '../dto/role/UpdateRoleDTO';

const roleRouter = Router();
const roleController = new RoleController(roleService);

roleRouter.use(authenticate, subscriptionMiddleware);

roleRouter.get('/', checkPermission('FUNCIONARIOS'), roleController.list);

roleRouter.post(
  '/',
  roleLimiter,
  checkPermission('FUNCIONARIOS'),
  validateRequest(createRoleSchema),
  roleController.create
);

roleRouter.put(
  '/:id',
  roleLimiter,
  checkPermission('FUNCIONARIOS'),
  validateRequest(updateRoleSchema),
  roleController.update
);

roleRouter.delete('/:id', roleLimiter, checkPermission('FUNCIONARIOS'), roleController.delete);

export { roleRouter };
