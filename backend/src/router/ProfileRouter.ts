import { Router } from 'express';
import { profileController } from '../controller'; 
import { authenticate } from '../middleware/authenticate';
import { validateRequest } from '../middleware/validateRequest';
import { updateProfileSchema } from '../dto/profile/UpdateProfileDTO';
import { changePasswordSchema } from '../dto/profile/ChangePasswordDTO';

const profileRouter = Router();

profileRouter.use(authenticate);

profileRouter.get('/', profileController.get);

profileRouter.put(
  '/', 
  validateRequest(updateProfileSchema), 
  profileController.update
);

profileRouter.patch(
  '/senha', 
  validateRequest(changePasswordSchema), 
  profileController.changePassword
);

export { profileRouter };