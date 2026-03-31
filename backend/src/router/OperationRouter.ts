import { Router } from 'express'
import { OperationController } from '../controller/OperationController'
import authenticate from '../middleware/authenticate'
import { checkPermission } from '../middleware/roleAccessControl'

const operationRouter = Router()
const operationController = new OperationController()

// --- ROTAS DO GERENTE (Exigem Autenticação e Permissão) ---
// Cupons
operationRouter.post('/cupons', authenticate, checkPermission('COUPONS_MANAGE', 'ALL'), operationController.createCoupon)
operationRouter.get('/cupons', authenticate, checkPermission('COUPONS_VIEW', 'ALL'), operationController.listCoupons)
operationRouter.delete('/cupons/:id', authenticate, checkPermission('COUPONS_MANAGE', 'ALL'), operationController.deleteCoupon)

// Estilo do Menu
operationRouter.put('/configuracao/estilo', authenticate, checkPermission('MENU_STYLE_EDIT', 'ALL'), operationController.updateMenuConfig)
operationRouter.get('/configuracao/estilo', authenticate, checkPermission('MENU_STYLE_VIEW', 'ALL'), operationController.getMenuConfig)

// --- ROTAS DO TOTEM (Acesso Aberto para a aplicação React Native) ---
operationRouter.post('/totem/cupons/validar', operationController.validateCouponForTotem)
operationRouter.get('/totem/configuracao/:establishmentId', operationController.getMenuConfig)

export { operationRouter }