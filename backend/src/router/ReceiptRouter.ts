import { Router } from 'express';
import { ReceiptController } from '../controller/ReceiptController';
import authenticate from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';

const receiptRouter = Router();
const receiptController = new ReceiptController();

receiptRouter.post('/', authenticate, checkPermission('RECEIPTS_MANAGE', 'ALL'), receiptController.create);

receiptRouter.get('/', authenticate, checkPermission('RECEIPTS_VIEW', 'ALL'), receiptController.list);

receiptRouter.get('/:id', authenticate, checkPermission('RECEIPTS_VIEW', 'ALL'), receiptController.getDetails);

export { receiptRouter };