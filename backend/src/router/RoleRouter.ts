import { Router } from 'express';
import { RoleController } from '../controller/RoleController';
import { roleService } from '../service';
import authenticate from '../middleware/authenticate';

// 🔥 Importando a nossa Blindagem Zod
import { validateRequest } from '../middleware/validateRequest';
import { createRoleSchema, updateRoleSchema } from '../dto/role/RoleDTO';

const roleRouter = Router();
const roleController = new RoleController(roleService);

roleRouter.use(authenticate);

roleRouter.get('/', roleController.list);

roleRouter.post('/', validateRequest(createRoleSchema), roleController.create);
roleRouter.put('/:id', validateRequest(updateRoleSchema), roleController.update);

roleRouter.delete('/:id', roleController.delete);

export { roleRouter };