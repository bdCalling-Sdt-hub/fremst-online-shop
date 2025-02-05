import express from 'express';
import { TagsController } from './tags.controller';

const router = express.Router();

router.get('/'); 

export const TagsRoutes = router;
