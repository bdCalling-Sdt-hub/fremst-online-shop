// import express from 'express';
// import { CartController } from './cart.controller';
// import auth from '../../middleware/auth';
// import { USER_ROLES } from '../../../enum/user';
// import validateRequest from '../../middleware/validateRequest';
// import { CartValidations } from './cart.validation';

// const router = express.Router();

// router.post('/',auth( USER_ROLES.EMPLOYEE), validateRequest(CartValidations.createOrUpdateCartZodSchema), CartController.addToCart);
// router.patch('/:id',auth( USER_ROLES.EMPLOYEE), validateRequest(CartValidations.removeProductFromCartZodSchema), CartController.removeProductFromCart);
// router.delete('/',auth( USER_ROLES.EMPLOYEE), CartController.deleteCart);
// router.get('/',auth( USER_ROLES.EMPLOYEE), CartController.getCartByUser);
// export const CartRoutes = router;
