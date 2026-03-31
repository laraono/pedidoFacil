import { Router } from 'express';
import { EstablishmentController } from '../controller/EstablishmentController';
import authenticate from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';

const establishmentRouter = Router();
const establishmentController = new EstablishmentController();

establishmentRouter.post(
  '/onboarding',
  authenticate,
  establishmentController.onboarding,
);

establishmentRouter.post(
  '/finalize',
  authenticate,
  establishmentController.finalize,
);

establishmentRouter.get(
  '/profile',
  authenticate,
  checkPermission('ESTABELECIMENTO_VIEW', 'ALL'),
  establishmentController.getProfile,
);
establishmentRouter.put(
  '/profile',
  authenticate,
  checkPermission('ESTABELECIMENTO_EDIT', 'ALL'),
  establishmentController.update,
);
establishmentRouter.delete(
  '/disable',
  authenticate,
  checkPermission('ESTABELECIMENTO_DELETE', 'ALL'),
  establishmentController.disable,
);

export { establishmentRouter };
