import { Router } from 'express';
import { ContactController } from '../controller/ContactController';
import { validateRequest } from '../middleware/validateRequest';
import { contactSchema } from '../validator/contact/contactSchema';
import { createRateLimiter } from '../middleware/rateLimit';

const contactRouter = Router();

const limitadorContato = createRateLimiter(60, 3, 'Muitas mensagens enviadas. Por favor, tente novamente em uma hora.');

contactRouter.post('/', limitadorContato, validateRequest(contactSchema), ContactController.sendContactEmail);

export { contactRouter };