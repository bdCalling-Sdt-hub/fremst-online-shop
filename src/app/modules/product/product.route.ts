import express, { NextFunction, Request, Response } from 'express';
import { ProductController } from './product.controller';
import { USER_ROLES } from '../../../enum/user';
import auth from '../../middleware/auth';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import { ProductValidations } from './product.validation';

const router = express.Router();

router.post('/',auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), fileUploadHandler(),
(req: Request, res: Response, next: NextFunction) => {

    if (req.body.data) {
        req.body = ProductValidations.createProductZodSchema.parse(
            JSON.parse(req.body.data),
        )
    }
    return ProductController.createProduct(req, res, next)
}
);
router.patch('/:id',auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), fileUploadHandler(),
(req: Request, res: Response, next: NextFunction) => {


    if (req.body.data) {
        req.body = ProductValidations.updateProductZodSchema.parse(
            JSON.parse(req.body.data),
        )
    }
    return ProductController.updateProduct(req, res, next)
});

router.get('/:id',auth(USER_ROLES.EMPLOYEE, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),ProductController.getSingleProduct);
router.delete('/:id',auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ProductController.deleteProduct);
router.get('/',auth(USER_ROLES.EMPLOYEE, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN,USER_ROLES.COMPANY), ProductController.getAllProduct);

export const ProductRoutes = router;
