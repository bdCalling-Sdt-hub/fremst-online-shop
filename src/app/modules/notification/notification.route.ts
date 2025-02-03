import express from 'express';
import { NotificationController } from './notification.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';

const router = express.Router();

router.get('/',auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.COMPANY), NotificationController.getAllNotification); 
router.get('/:id',auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.COMPANY, USER_ROLES.EMPLOYEE), NotificationController.getSingleNotification); 

export const NotificationRoutes = router;
