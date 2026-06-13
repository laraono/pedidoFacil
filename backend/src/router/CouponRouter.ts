import { Router } from 'express';
import { CouponController } from '../controller/CouponController';
import { couponService } from '../service';
import { authenticate } from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';
import { subscriptionMiddleware } from '../middleware';
import { validateRequest } from '../middleware/validateRequest'; 
import { createCouponSchema } from '../dto/coupon/CreateCouponDTO'; 

const couponRouter = Router();
const couponController = new CouponController(couponService);

couponRouter.get(
  '/validate/:code',
  couponController.validate.bind(couponController),
);

couponRouter.use(authenticate);
couponRouter.use(subscriptionMiddleware);

couponRouter.get(
  '/',
  checkPermission('CUPONS'),
  couponController.list.bind(couponController),
);

couponRouter.post(
  '/',
  checkPermission('CUPONS'),
  validateRequest(createCouponSchema),
  couponController.create.bind(couponController),
);

couponRouter.put(
  '/:id',
  checkPermission('CUPONS'),
  validateRequest(createCouponSchema),
  couponController.update.bind(couponController),
);

couponRouter.delete(
  '/:id',
  checkPermission('CUPONS'),
  couponController.delete.bind(couponController),
);

export { couponRouter };