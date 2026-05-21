import { Router } from 'express';
import { receiptController } from '../controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';
import { subscriptionMiddleware } from '../middleware';

const receiptRouter = Router();

receiptRouter.use(authenticate, subscriptionMiddleware)

receiptRouter.post(
  '/',
  authenticate,
  checkPermission('RECEIPTS_MANAGE', 'ALL'),
  receiptController.create,
);

receiptRouter.get(
  '/',
  authenticate,
  checkPermission('RECEIPTS_VIEW', 'ALL'),
  receiptController.list,
);

receiptRouter.delete(
  '/:id',
  authenticate,
  checkPermission('RECEIPTS_MANAGE', 'ALL'),
  receiptController.delete,
);

export { receiptRouter };
