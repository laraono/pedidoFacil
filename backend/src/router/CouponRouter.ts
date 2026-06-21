import { Router } from 'express';
import { CouponController, couponLimiter } from '../controller/CouponController';
import { couponService } from '../service';
import { authenticate } from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';
import { Permission } from '../enum';
import { subscriptionMiddleware } from '../middleware';
import { validateRequest } from '../middleware/validateRequest';
import { createCouponSchema } from '../dto/coupon/CreateCouponDTO';
import { authenticateOrTotem } from '../middleware/authenticateOrTotem';

const couponRouter = Router();
const couponController = new CouponController(couponService);

couponRouter.use(couponLimiter);

couponRouter.get(
  '/validate/:code',
  authenticateOrTotem,
  couponController.validate.bind(couponController),
);

couponRouter.use(authenticate);
couponRouter.use(subscriptionMiddleware);

couponRouter.get(
  '/',
  checkPermission(Permission.CUPONS),
  couponController.list.bind(couponController),
);

couponRouter.post(
  '/',
  checkPermission(Permission.CUPONS),
  validateRequest(createCouponSchema),
  couponController.create.bind(couponController),
);

couponRouter.put(
  '/:id',
  checkPermission(Permission.CUPONS),
  validateRequest(createCouponSchema),
  couponController.update.bind(couponController),
);

couponRouter.delete(
  '/:id',
  checkPermission(Permission.CUPONS),
  couponController.delete.bind(couponController),
);

export { couponRouter };
