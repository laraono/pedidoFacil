import { Router } from 'express';
import { receiptController } from '../controller';
import authenticate from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';

const receiptRouter = Router();

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
