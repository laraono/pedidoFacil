import { Router } from 'express';
import { employeeController } from '../controller';
import authenticate from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';
import { validateCreateEmployee, validateUpdateEmployee } from '../validator/employee/employeeSchema';

const employeeRouter = Router();

employeeRouter.use(authenticate);

employeeRouter.get('/', authenticate, checkPermission('USUARIO_VIEW', 'ALL'), employeeController.list);
employeeRouter.get('/inactive', authenticate, checkPermission('USUARIO_VIEW', 'ALL'), employeeController.listInactive);

employeeRouter.post('/', authenticate, checkPermission('USUARIO_CREATE', 'ALL'), validateCreateEmployee, employeeController.create);
employeeRouter.put('/:id', authenticate, checkPermission('USUARIO_EDIT', 'ALL'), validateUpdateEmployee, employeeController.update);
employeeRouter.delete('/:id', authenticate, checkPermission('USUARIO_DELETE', 'ALL'), employeeController.delete);
employeeRouter.patch('/:id/reactivate', authenticate, checkPermission('USUARIO_EDIT', 'ALL'), employeeController.reactivate);

export { employeeRouter };