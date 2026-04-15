import { Router } from 'express';
import { EstablishmentController } from '../controller/EstablishmentController';
import authenticate from '../middleware/authenticate';
const { checkPermission } = require('../middleware/roleAccessControl'); 
import { establishmentService } from '../service'; 

import { validateRequest } from '../middleware/validateRequest';
import { UpdateEstablishmentDTO } from '../dto/establishment/UpdateEstablishmentDTO';

const establishmentRouter = Router();
const establishmentController = new EstablishmentController(establishmentService);

establishmentRouter.get(
  '/:id/public',
  establishmentController.getPublicProfile
);

establishmentRouter.post(
  '/onboarding',
  authenticate,
  establishmentController.onboarding
);

establishmentRouter.post(
  '/finalize',
  authenticate,
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