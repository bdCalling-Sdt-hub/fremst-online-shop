import express, { NextFunction, Request, Response } from 'express';
import { CategoryController } from './category.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import { CategoryValidations } from './category.validation';

const router = express.Router();

router.post('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN),fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = CategoryValidations.createCategoryZodSchema.parse(
          JSON.parse(req.body.data),
        )
      }
      return CategoryController.createCategory(req, res, next)
    },
);

router.patch('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      console.log(req.body.data)
      if (req.body.data) {
        req.body = CategoryValidations.updateCategoryZodSchema.parse(
          JSON.parse(req.body.data),
        )
      }
      return CategoryController.updateCategory(req, res, next)
    },
);
router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.COMPANY, USER_ROLES.EMPLOYEE),CategoryController.getAllCategory);

export const CategoryRoutes = router;
