import { Router } from 'express';
import { EmployeeController } from '../controller/EmployeeController';
import authenticate from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';

const employeeRouter = Router();
const employeeController = new EmployeeController();

employeeRouter.use(authenticate);
employeeRouter.get('/', checkPermission('USUARIO_VIEW', 'ALL'), employeeController.list.bind(employeeController));

employeeRouter.get('/inactive', checkPermission('USUARIO_VIEW', 'ALL'), employeeController.listInactive.bind(employeeController));

employeeRouter.post('/', checkPermission('USUARIO_CREATE', 'ALL'), employeeController.create.bind(employeeController));
employeeRouter.put('/:id', checkPermission('USUARIO_EDIT', 'ALL'), employeeController.update.bind(employeeController));
employeeRouter.delete('/:id', checkPermission('USUARIO_DELETE', 'ALL'), employeeController.delete.bind(employeeController));

employeeRouter.patch('/:id/reactivate', checkPermission('USUARIO_EDIT', 'ALL'), employeeController.reactivate.bind(employeeController));

export { employeeRouter };