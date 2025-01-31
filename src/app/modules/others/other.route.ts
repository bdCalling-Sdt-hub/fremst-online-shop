import express from 'express';
import { OtherController } from './other.controller';
import validateRequest from '../../middleware/validateRequest';
import { OtherValidations } from './other.validation';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';
const router = express.Router()


router.post('/',auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(OtherValidations.createOrUpdateOthersZodSchema), OtherController.createOrUpdateOthers)

router.get('/:type', OtherController.getOthers)

export const OtherRoutes = router;