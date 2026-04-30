import { Router } from 'express';
import { RoleController } from '../controller/RoleController';
import { roleService } from '../service';
import authenticate from '../middleware/authenticate';
<<<<<<< HEAD

// 🔥 Importando a nossa Blindagem Zod
import { validateRequest } from '../middleware/validateRequest';
import { createRoleSchema, updateRoleSchema } from '../dto/role/RoleDTO';
=======
import { validateRole } from '../validator/role/roleSchema';
>>>>>>> feature-104

const roleRouter = Router();
const roleController = new RoleController(roleService);

roleRouter.use(authenticate);

roleRouter.get('/', roleController.list);
<<<<<<< HEAD

roleRouter.post('/', validateRequest(createRoleSchema), roleController.create);
roleRouter.put('/:id', validateRequest(updateRoleSchema), roleController.update);

=======
roleRouter.post('/', validateRole, roleController.create);
roleRouter.put('/:id', validateRole, roleController.update);
>>>>>>> feature-104
roleRouter.delete('/:id', roleController.delete);

export { roleRouter };