import { Router } from 'express';
import { EstablishmentController } from '../controller/EstablishmentController';
import authenticate from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';
import { establishmentService } from '../service'; 
import { 
    validateSaveOnboarding, 
    validateFinalizeOnboarding, 
    validateUpdateEstablishment 
} from '../validator/establishment/establishmentSchema';

const establishmentRouter = Router();
const establishmentController = new EstablishmentController(establishmentService);

establishmentRouter.post(
  '/onboarding',
  authenticate,
  validateSaveOnboarding,
  establishmentController.onboarding // <-- Sem .bind() agora
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
  validateUpdateEstablishment,
  establishmentController.update
);

establishmentRouter.delete(
  '/disable',
  authenticate,
  checkPermission('ESTABELECIMENTO_DELETE', 'ALL'),
  establishmentController.disable
);

export { establishmentRouter };