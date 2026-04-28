import { Router } from 'express';
import { CouponController, couponLimiter } from '../controller/CouponController';
import { couponService } from '../service'; 
import authenticate from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';
import { validateCreateCoupon } from '../validator/coupon/couponSchema';

const couponRouter = Router();
const couponController = new CouponController(couponService);

couponRouter.get('/', authenticate, checkPermission('CUPOM_VIEW', 'ALL'), couponController.list.bind(couponController));
couponRouter.post('/', authenticate, checkPermission('CUPOM_CREATE', 'ALL'), validateCreateCoupon, couponController.create.bind(couponController));
couponRouter.put('/:id', authenticate, checkPermission('CUPOM_EDIT', 'ALL'), validateCreateCoupon, couponController.update.bind(couponController));
couponRouter.delete('/:id', authenticate, checkPermission('CUPOM_DELETE', 'ALL'), couponController.delete.bind(couponController));
couponRouter.get('/validate/:code', couponLimiter, authenticate, checkPermission('CUPOM_VIEW', 'ALL'), couponController.validate.bind(couponController));

export { couponRouter };