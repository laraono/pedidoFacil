import { Router } from 'express';
import { CouponController } from '../controller/CouponController';
import { couponService } from '../service'; 
import authenticate from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';
import { validateCreateCoupon } from '../validator/coupon/couponSchema';
import { subscriptionMiddleware } from '../middleware';

const couponRouter = Router();
const couponController = new CouponController(couponService);

couponRouter.get(
  '/validate/:code', 
  couponController.validate.bind(couponController)
);

couponRouter.use(authenticate);
couponRouter.use(subscriptionMiddleware)

couponRouter.get(
  '/', 
  checkPermission('CUPOM_VIEW', 'ALL'), 
  couponController.list.bind(couponController)
);

couponRouter.post(
  '/', 
  checkPermission('CUPOM_CREATE', 'ALL'), 
  validateCreateCoupon, 
  couponController.create.bind(couponController)
);

couponRouter.put(
  '/:id', 
  checkPermission('CUPOM_EDIT', 'ALL'), 
  validateCreateCoupon, 
  couponController.update.bind(couponController)
);

couponRouter.delete(
  '/:id', 
  checkPermission('CUPOM_DELETE', 'ALL'), 
  couponController.delete.bind(couponController)
);

export { couponRouter };
