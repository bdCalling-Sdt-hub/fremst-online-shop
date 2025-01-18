import express from 'express';
import { ProductController } from './product.controller';

const router = express.Router();

router.get('/'); 

export const ProductRoutes = router;
