import express from 'express';
import { OrderController } from './order.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';
import validateRequest from '../../middleware/validateRequest';
import { OrderValidation } from './order.validation';

const router = express.Router();

// Create order - Only employees can create orders
router.post(
  '/',
  auth(USER_ROLES.EMPLOYEE),
  validateRequest(OrderValidation.createOrderZodSchema),
  OrderController.createOrder
);

// Update order status - Only admin and super admin can update status
router.patch(
  '/:id/status',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(OrderValidation.updateOrderStatusZodSchema),
  OrderController.updateOrderStatus
);

// Get yearly order statistics - Accessible by all authenticated users
router.get(
  '/stats/:year?',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.EMPLOYEE),
  OrderController.getYearlyOrderStats
);

export const OrderRoutes = router;
