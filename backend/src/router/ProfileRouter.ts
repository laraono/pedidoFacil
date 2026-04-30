import { Router } from 'express';
import { profileController } from '../controller'; 
import authenticate from '../middleware/authenticate';
<<<<<<< HEAD

import { validateRequest } from '../middleware/validateRequest';
import { updateProfileSchema, changePasswordSchema } from '../dto/profile/ProfileDTO'; // Confirme o nome do arquivo
=======
import { validateUpdateProfile, validateChangePassword } from '../validator/profile/profileSchema';
>>>>>>> feature-104

const profileRouter = Router();

profileRouter.use(authenticate);

profileRouter.get('/', profileController.get);
<<<<<<< HEAD

profileRouter.put('/', validateRequest(updateProfileSchema), profileController.update);
profileRouter.patch('/senha', validateRequest(changePasswordSchema), profileController.changePassword);
=======
profileRouter.put('/', validateUpdateProfile, profileController.update);
profileRouter.patch('/senha', validateChangePassword, profileController.changePassword);
>>>>>>> feature-104

export { profileRouter };