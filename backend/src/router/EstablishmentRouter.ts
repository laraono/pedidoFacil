import { Router } from 'express';
import { EstablishmentController } from '../controller/EstablishmentController';
import { authenticate } from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';
import { Permission } from '../enum';
import { establishmentService } from '../service';
//import { validateSaveOnboarding, validateFinalizeOnboarding } from '../validator/establishment/establishmentSchema';
import { validateRequest } from '../middleware/validateRequest';
import { UpdateEstablishmentDTO } from '../dto/establishment/UpdateEstablishmentDTO';
import { validateUpload } from '../middleware/validateUpload';
import rateLimit from 'express-rate-limit';

const establishmentRouter = Router();
const establishmentController = new EstablishmentController(establishmentService);

const codeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (_req, res) => res.status(429).json({ error: 'Muitas tentativas. Tente novamente em 15 minutos.' }),
});

establishmentRouter.post('/check-cnpj', establishmentController.checkCnpj);

establishmentRouter.get(
  '/code/:code',
  codeLimiter,
  establishmentController.getByCode
);

establishmentRouter.get(
  '/:id/public',
  establishmentController.getPublicProfile
);

establishmentRouter.get(
  '/profile',
  authenticate,
  checkPermission(Permission.CONFIGURACAO),
  establishmentController.getProfile
);

establishmentRouter.put(
  '/profile',
  authenticate,
  checkPermission(Permission.CONFIGURACAO),
  validateUpload.fields([{ name: 'logo', maxCount: 1 }]),
  validateRequest(UpdateEstablishmentDTO),
  establishmentController.update
);

establishmentRouter.delete(
  '/disable',
  authenticate,
  checkPermission(Permission.CONFIGURACAO),
  establishmentController.disable
);



export { establishmentRouter };
