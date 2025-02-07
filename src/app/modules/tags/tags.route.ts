import express from 'express';
import { TagsController } from './tags.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';
import validateRequest from '../../middleware/validateRequest';
import { TagsValidations } from './tags.validation';

const router = express.Router();

router.post('/', 
    // auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), 
validateRequest(TagsValidations.createTagZodSchema), TagsController.createTag);
router.patch('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(TagsValidations.updateTagZodSchema), TagsController.updateTag);
router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), TagsController.deleteTag);
router.patch('/add-customer-or-remove-from-tag/:id', 
    // auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
 validateRequest(TagsValidations.addCustomerOrRemoveFromTagZodSchema), TagsController.addCustomerOrRemoveFromTag);
 
 router.patch('/add-or-remove-product-from-tag/:id', 
     // auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(TagsValidations.addOrRemoveProductFromTagZodSchema), TagsController.addOrRemoveProductFromTag);
  
router.get('/',
    //  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.COMPANY, USER_ROLES.EMPLOYEE),
 TagsController.getAllTags);

export const TagsRoutes = router;
