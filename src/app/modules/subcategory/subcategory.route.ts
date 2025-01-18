import express, { NextFunction, Request, Response } from 'express';
import { SubcategoryController } from './subcategory.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import { SubcategoryValidations } from './subcategory.validation';

const router = express.Router();

router.post('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN),
fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = SubcategoryValidations.createSubcategoryZodSchema.parse(
          JSON.parse(req.body.data),
        )
      }
      return SubcategoryController.createSbCategory(req, res, next)
    },
);
router.patch('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = SubcategoryValidations.updateSubcategoryZodSchema.parse(
          JSON.parse(req.body.data),
        )
      }
      return SubcategoryController.updateSubcategory(req, res, next)
    },);



export const SubcategoryRoutes = router;
