import { Router } from 'express'
import { AccessController } from '../controller/AccessController'
import authenticate from '../middleware/authenticate'
import { checkPermission } from '../middleware/roleAccessControl'

const accessRouter = Router()
const accessController = new AccessController()

accessRouter.post('/cargos', authenticate, checkPermission('ROLES_MANAGE', 'ALL'), accessController.createRole)
accessRouter.get('/cargos', authenticate, checkPermission('ROLES_VIEW', 'ALL'), accessController.listRoles)

accessRouter.post('/funcionarios', authenticate, checkPermission('USERS_MANAGE', 'ALL'), accessController.createEmployee)
accessRouter.get('/funcionarios', authenticate, checkPermission('USERS_VIEW', 'ALL'), accessController.listEmployees)

export { accessRouter }