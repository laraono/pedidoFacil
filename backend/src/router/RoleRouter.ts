import { Router } from 'express';
import { RoleController } from '../controller/RoleController';
import { roleService } from '../service';
import authenticate from '../middleware/authenticate';
import { validateRole } from '../validator/role/roleSchema';
import { subscriptionMiddleware } from '../middleware';

const roleRouter = Router();
const roleController = new RoleController(roleService);

roleRouter.use(authenticate);
roleRouter.use(subscriptionMiddleware)

roleRouter.get('/', roleController.list);
roleRouter.post('/', validateRole, roleController.create);
roleRouter.put('/:id', validateRole, roleController.update);
roleRouter.delete('/:id', roleController.delete);

export { roleRouter };