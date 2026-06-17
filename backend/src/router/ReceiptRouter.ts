import { Router } from 'express';
import { receiptController, receiptLimiter } from '../controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';
import { Permission } from '../enum';
import { subscriptionMiddleware } from '../middleware';

const receiptRouter = Router();

receiptRouter.use(authenticate, subscriptionMiddleware)

receiptRouter.post(
  '/',
  receiptLimiter,
  checkPermission(Permission.NOTA_FISCAL),
  receiptController.create,
);

receiptRouter.get(
  '/',
  receiptLimiter,
  checkPermission(Permission.NOTA_FISCAL),
  receiptController.list,
);

receiptRouter.delete(
  '/:id',
  receiptLimiter,
  checkPermission(Permission.NOTA_FISCAL),
  receiptController.delete,
);

export { receiptRouter };
