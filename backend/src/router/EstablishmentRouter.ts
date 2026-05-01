import { Router } from 'express';
import { EstablishmentController } from '../controller/EstablishmentController';
import authenticate from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';
import { establishmentService } from '../service'; 
import { 
    validateSaveOnboarding, 
    validateFinalizeOnboarding 
} from '../validator/establishment/establishmentSchema';
import { validateRequest } from '../middleware/validateRequest';
import { UpdateEstablishmentDTO } from '../dto/establishment/UpdateEstablishmentDTO';
import { validateUpload } from '../middleware/validateUpload';

const establishmentRouter = Router();
const establishmentController = new EstablishmentController(establishmentService);

establishmentRouter.get(
  '/:id/public',
  establishmentController.getPublicProfile
);

establishmentRouter.post(
  '/onboarding',
  authenticate,
  validateSaveOnboarding,
  establishmentController.onboarding
);

establishmentRouter.post(
  '/finalize',
  authenticate,
  validateFinalizeOnboarding,
  establishmentController.finalize
);

establishmentRouter.get(
  '/profile',
  authenticate,
  checkPermission('ESTABELECIMENTO_VIEW', 'ALL'),
  establishmentController.getProfile
);

establishmentRouter.put(
  '/profile',
  authenticate,
  checkPermission('ESTABELECIMENTO_EDIT', 'ALL'),
  validateUpload.single('logo'),   
  validateRequest(UpdateEstablishmentDTO), 
  establishmentController.update   
);

establishmentRouter.delete(
  '/disable',
  authenticate,
  checkPermission('ESTABELECIMENTO_DELETE', 'ALL'),
  establishmentController.disable
);

export { establishmentRouter };