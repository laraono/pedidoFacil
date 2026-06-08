import { Router } from 'express';
import { EstablishmentController } from '../controller/EstablishmentController';
import { authenticate } from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';
import { establishmentService } from '../service';
//import { validateSaveOnboarding, validateFinalizeOnboarding } from '../validator/establishment/establishmentSchema';
import { validateRequest } from '../middleware/validateRequest';
import { UpdateEstablishmentDTO } from '../dto/establishment/UpdateEstablishmentDTO';
import { validateUpload } from '../middleware/validateUpload';

const establishmentRouter = Router();
const establishmentController = new EstablishmentController(establishmentService);

establishmentRouter.post('/check-cnpj', establishmentController.checkCnpj);

establishmentRouter.get(
  '/code/:code',
  establishmentController.getByCode
);

establishmentRouter.get(
  '/:id/public',
  establishmentController.getPublicProfile
);

establishmentRouter.get(
  '/profile',
  authenticate,
  checkPermission('CONFIGURACAO'),
  establishmentController.getProfile
);

establishmentRouter.put(
  '/profile',
  authenticate,
  checkPermission('CONFIGURACAO'),
  validateUpload.fields([{ name: 'logo', maxCount: 1 }, { name: 'pixQrCode', maxCount: 1 }]),
  validateRequest(UpdateEstablishmentDTO),
  establishmentController.update
);

establishmentRouter.delete(
  '/disable',
  authenticate,
  checkPermission('CONFIGURACAO'),
  establishmentController.disable
);



export { establishmentRouter };
