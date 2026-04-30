import { Router } from 'express';
import { EstablishmentController } from '../controller/EstablishmentController';
import authenticate from '../middleware/authenticate';
<<<<<<< HEAD
const { checkPermission } = require('../middleware/roleAccessControl'); 
import { establishmentService } from '../service'; 

import { validateRequest } from '../middleware/validateRequest';
import { UpdateEstablishmentDTO } from '../dto/establishment/UpdateEstablishmentDTO';
=======
import { checkPermission } from '../middleware/roleAccessControl';
import { establishmentService } from '../service'; 
import { 
    validateSaveOnboarding, 
    validateFinalizeOnboarding, 
    validateUpdateEstablishment 
} from '../validator/establishment/establishmentSchema';
>>>>>>> feature-104

const establishmentRouter = Router();
const establishmentController = new EstablishmentController(establishmentService);

establishmentRouter.get(
  '/:id/public',
  establishmentController.getPublicProfile
);

establishmentRouter.post(
  '/onboarding',
  authenticate,
<<<<<<< HEAD
=======
  validateSaveOnboarding,
>>>>>>> feature-104
  establishmentController.onboarding
);

establishmentRouter.post(
  '/finalize',
  authenticate,
<<<<<<< HEAD
=======
  validateFinalizeOnboarding,
>>>>>>> feature-104
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
<<<<<<< HEAD
  validateRequest(UpdateEstablishmentDTO), 
=======
  validateUpdateEstablishment,
>>>>>>> feature-104
  establishmentController.update
);

establishmentRouter.delete(
  '/disable',
  authenticate,
  checkPermission('ESTABELECIMENTO_DELETE', 'ALL'),
  establishmentController.disable
);

export { establishmentRouter };