import { Router } from 'express';
import { profileController } from '../controller'; 
import authenticate from '../middleware/authenticate';
import { validateUpdateProfile, validateChangePassword } from '../validator/profile/profileSchema';

const profileRouter = Router();

profileRouter.use(authenticate);

profileRouter.get('/', profileController.get);
profileRouter.put('/', validateUpdateProfile, profileController.update);
profileRouter.patch('/senha', validateChangePassword, profileController.changePassword);

export { profileRouter };