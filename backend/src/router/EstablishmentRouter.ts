import { Router } from 'express';
import { EstablishmentController } from '../controller/EstablishmentController';
import authenticate from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';

const establishmentRouter = Router();
const establishmentController = new EstablishmentController();

// STEP 2: Basic Data (Manager is logged in but doesn't have a role yet)
establishmentRouter.post(
  '/onboarding',
  authenticate,
  establishmentController.onboarding,
);

// STEP 3: Roles and final configs (Finalizes the process)
establishmentRouter.post(
  '/finalize',
  authenticate,
  establishmentController.finalize,
);

// Post-onboarding management (Requires RBAC)
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
