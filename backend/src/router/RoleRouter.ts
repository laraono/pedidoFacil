import { Router } from 'express';
import { RoleController, roleLimiter } from '../controller/RoleController';
import { roleService } from '../service';
import { authenticate } from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';
import { Permission } from '../enum';
import { subscriptionMiddleware } from '../middleware';
import { validateRequest } from '../middleware/validateRequest';
import { createRoleSchema } from '../dto/role/CreateRoleDTO';
import { updateRoleSchema } from '../dto/role/UpdateRoleDTO';

const roleRouter = Router();
const roleController = new RoleController(roleService);

roleRouter.use(authenticate, subscriptionMiddleware);

roleRouter.get('/', checkPermission(Permission.FUNCIONARIOS), roleController.list);

roleRouter.post(
  '/',
  roleLimiter,
  checkPermission(Permission.FUNCIONARIOS),
  validateRequest(createRoleSchema),
  roleController.create
);

roleRouter.put(
  '/:id',
  roleLimiter,
  checkPermission(Permission.FUNCIONARIOS),
  validateRequest(updateRoleSchema),
  roleController.update
);

roleRouter.delete('/:id', roleLimiter, checkPermission(Permission.FUNCIONARIOS), roleController.delete);

export { roleRouter };
