import { Router } from 'express';
import { RoleController, roleLimiter } from '../controller/RoleController';
import { roleService } from '../service';
import { authenticate } from '../middleware/authenticate';

import { validateRequest } from '../middleware/validateRequest';
import { createRoleSchema } from '../dto/role/CreateRoleDTO'; 
import { updateRoleSchema } from '../dto/role/UpdateRoleDTO';

const roleRouter = Router();
const roleController = new RoleController(roleService);

roleRouter.use(authenticate);

roleRouter.get('/', roleController.list);

roleRouter.post(
  '/', 
  roleLimiter, 
  validateRequest(createRoleSchema), 
  roleController.create
);

roleRouter.put(
  '/:id', 
  roleLimiter, 
  validateRequest(updateRoleSchema), 
  roleController.update
);

roleRouter.delete('/:id', roleLimiter, roleController.delete);

export { roleRouter };