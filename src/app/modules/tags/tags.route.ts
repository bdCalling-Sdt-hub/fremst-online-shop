import express from 'express';
import { TagsController } from './tags.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';

const router = express.Router();

router.post('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), TagsController.createTag);
router.patch('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), TagsController.updateTag);
router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), TagsController.deleteTag);
router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), TagsController.getAllTags);
router.post('/add-customer-or-remove-from-tag', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), TagsController.addCustomerOrRemoveFromTag);

export const TagsRoutes = router;
