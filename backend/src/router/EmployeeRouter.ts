import { Router } from 'express';
import { employeeController } from '../controller';
import authenticate from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';
<<<<<<< HEAD

import { validateRequest } from '../middleware/validateRequest';
import { createEmployeeSchema, updateEmployeeSchema } from '../dto/employee/EmployeeDTO';
=======
import { validateCreateEmployee, validateUpdateEmployee } from '../validator/employee/employeeSchema';
>>>>>>> feature-104

const employeeRouter = Router();

employeeRouter.use(authenticate);

employeeRouter.get('/', checkPermission('USUARIO_VIEW', 'ALL'), employeeController.list);
employeeRouter.get('/inactive', checkPermission('USUARIO_VIEW', 'ALL'), employeeController.listInactive);

<<<<<<< HEAD
employeeRouter.post('/', checkPermission('USUARIO_CREATE', 'ALL'), validateRequest(createEmployeeSchema), employeeController.create);
employeeRouter.put('/:id', checkPermission('USUARIO_EDIT', 'ALL'), validateRequest(updateEmployeeSchema), employeeController.update);

=======
employeeRouter.post('/', checkPermission('USUARIO_CREATE', 'ALL'), validateCreateEmployee, employeeController.create);
employeeRouter.put('/:id', checkPermission('USUARIO_EDIT', 'ALL'), validateUpdateEmployee, employeeController.update);
>>>>>>> feature-104
employeeRouter.delete('/:id', checkPermission('USUARIO_DELETE', 'ALL'), employeeController.delete);
employeeRouter.patch('/:id/reactivate', checkPermission('USUARIO_EDIT', 'ALL'), employeeController.reactivate);

export { employeeRouter };