import express from 'express';
import { OtherController } from './other.controller';
import validateRequest from '../../middleware/validateRequest';
import { OtherValidations } from './other.validation';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';
const router = express.Router()

router.get('/get-faq', OtherController.getFaqs)
router.post('/',auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(OtherValidations.createOrUpdateOthersZodSchema), OtherController.createOrUpdateOthers)

router.get('/:type', OtherController.getOthers)

router.post('/faq',auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(OtherValidations.createFaqZodSchema), OtherController.createFaq)

router.patch('/faq/:id',auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(OtherValidations.updateFaqZodSchema), OtherController.updateFaq)



router.delete('/faq/:id',auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), OtherController.removeFaq)

export const OtherRoutes = router;