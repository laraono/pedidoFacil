import { Router } from 'express';
import { webhookController } from '../controller';
import { validateWebhookSignature } from '../middleware';

const webhookRouter = Router();

webhookRouter.post('/pagamento', validateWebhookSignature, webhookController.handlePayment);

export { webhookRouter };

