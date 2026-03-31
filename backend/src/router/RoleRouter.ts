import { Router } from 'express';
import { RoleController } from '../controller/RoleController';
import authenticate from '../middleware/authenticate'; 

const roleRouter = Router();
const roleController = new RoleController();

roleRouter.use(authenticate);

roleRouter.get('/', roleController.list.bind(roleController));
roleRouter.post('/', roleController.create.bind(roleController));
roleRouter.put('/:id', roleController.update.bind(roleController));
roleRouter.delete('/:id', roleController.delete.bind(roleController));

export default roleRouter;