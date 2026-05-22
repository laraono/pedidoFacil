import { Router } from 'express';
import { RoleController, roleLimiter } from '../controller/RoleController';
import { roleService } from '../service';
import { authenticate } from '../middleware/authenticate';
import { validateRole } from '../validator/role/roleSchema';

const roleRouter = Router();
const roleController = new RoleController(roleService);

roleRouter.use(authenticate);

roleRouter.get('/', roleController.list);
roleRouter.post('/', roleLimiter, validateRole, roleController.create);
roleRouter.put('/:id', roleLimiter, validateRole, roleController.update);
roleRouter.delete('/:id', roleLimiter, roleController.delete);

export { roleRouter };