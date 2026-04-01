import { Router } from 'express';
import { ProfileController } from '../controller/ProfileController';
import authenticate from '../middleware/authenticate';

const profileRouter = Router();
const profileController = new ProfileController();

profileRouter.use(authenticate);

profileRouter.get('/', profileController.get.bind(profileController));
profileRouter.put('/', profileController.update.bind(profileController));
profileRouter.patch('/senha', profileController.changePassword.bind(profileController));

export { profileRouter };