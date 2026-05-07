import { Router } from 'express';
import { employeeController } from '../controller';
import authenticate from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';
import { validateCreateEmployee, validateUpdateEmployee } from '../validator/employee/employeeSchema';
import { subscriptionMiddleware } from '../middleware';

const employeeRouter = Router();

employeeRouter.use(authenticate);
employeeRouter.use(subscriptionMiddleware)

employeeRouter.get('/', checkPermission('USUARIO_VIEW', 'ALL'), employeeController.list);
employeeRouter.get('/inactive', checkPermission('USUARIO_VIEW', 'ALL'), employeeController.listInactive);

employeeRouter.post('/', checkPermission('USUARIO_CREATE', 'ALL'), validateCreateEmployee, employeeController.create);
employeeRouter.put('/:id', checkPermission('USUARIO_EDIT', 'ALL'), validateUpdateEmployee, employeeController.update);

employeeRouter.delete('/:id', checkPermission('USUARIO_DELETE', 'ALL'), employeeController.delete);
employeeRouter.patch('/:id/reactivate', checkPermission('USUARIO_EDIT', 'ALL'), employeeController.reactivate);

export { employeeRouter };