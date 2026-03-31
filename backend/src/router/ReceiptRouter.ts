import { Router } from 'express';
import { ReceiptController } from '../controller/ReceiptController';
import authenticate from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';

const receiptRouter = Router();
const receiptController = new ReceiptController();

/**
 * ROTAS DE NOTAS FISCAIS E RECIBOS
 */

// Gera uma nova nota a partir de um pagamento
receiptRouter.post('/', authenticate, checkPermission('RECEIPTS_MANAGE', 'ALL'), receiptController.create);

// Lista todas as notas do estabelecimento (usado na tela de histórico de notas da web)
receiptRouter.get('/', authenticate, checkPermission('RECEIPTS_VIEW', 'ALL'), receiptController.list);

// Pega os detalhes completos de uma nota para impressão
receiptRouter.get('/:id', authenticate, checkPermission('RECEIPTS_VIEW', 'ALL'), receiptController.getDetails);

export { receiptRouter };