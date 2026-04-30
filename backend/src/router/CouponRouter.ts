import { Router } from 'express';
import { CouponController } from '../controller/CouponController';
import { couponService } from '../service'; 
import authenticate from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';
<<<<<<< HEAD

import { validateRequest } from '../middleware/validateRequest';
import { createCouponSchema } from '../dto/coupon/CreateCouponDTO';
=======
import { validateCreateCoupon } from '../validator/coupon/couponSchema';
>>>>>>> feature-104

const couponRouter = Router();
const couponController = new CouponController(couponService);

couponRouter.use(authenticate);

couponRouter.get('/', checkPermission('CUPOM_VIEW', 'ALL'), couponController.list.bind(couponController));
<<<<<<< HEAD
couponRouter.post('/', checkPermission('CUPOM_CREATE', 'ALL'), validateRequest(createCouponSchema), couponController.create.bind(couponController));
couponRouter.put('/:id', checkPermission('CUPOM_EDIT', 'ALL'), validateRequest(createCouponSchema), couponController.update.bind(couponController));
=======
couponRouter.post('/', checkPermission('CUPOM_CREATE', 'ALL'), validateCreateCoupon, couponController.create.bind(couponController));
couponRouter.put('/:id', checkPermission('CUPOM_EDIT', 'ALL'), validateCreateCoupon, couponController.update.bind(couponController));
>>>>>>> feature-104
couponRouter.delete('/:id', checkPermission('CUPOM_DELETE', 'ALL'), couponController.delete.bind(couponController));
couponRouter.get('/validate/:code', checkPermission('CUPOM_VIEW', 'ALL'), couponController.validate.bind(couponController));

export { couponRouter };