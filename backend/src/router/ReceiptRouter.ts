import { Router } from 'express';
import { receiptController, receiptLimiter } from '../controller';
import authenticate from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';

const receiptRouter = Router();

receiptRouter.post(
  '/',
  authenticate, receiptLimiter,
  checkPermission('RECEIPTS_MANAGE', 'ALL'),
  receiptController.create,
);

receiptRouter.get(
  '/',
  authenticate, receiptLimiter,
  checkPermission('RECEIPTS_VIEW', 'ALL'),
  receiptController.list,
);

receiptRouter.delete(
  '/:id',
  authenticate, receiptLimiter,
  checkPermission('RECEIPTS_MANAGE', 'ALL'),
  receiptController.delete,
);

export { receiptRouter };
