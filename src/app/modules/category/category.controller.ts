import { Request, Response, NextFunction } from 'express';
import { CategoryServices } from './category.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
const createCategory = catchAsync(async (req: Request, res: Response) => {

    const payload = req.body;
    if (req.files && 'image' in req.files && req.files.image.length > 0) {
      payload.image = `/images/${req.files.image[0].filename}`
    }

    const category = await CategoryServices.createCategory(payload);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Category created successfully!',
      data: category,
    });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {  
    const payload = req.body;
    
    if (req.files && 'image' in req.files && req.files.image.length > 0) {
      payload.image = `/images/${req.files.image[0].filename}`
    }

    const category = await CategoryServices.updateCategory(req.params.id, payload);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Category updated successfully!',
      data: category,
    });
});


const getAllCategory = catchAsync(async (req: Request, res: Response) => {
    const category = await CategoryServices.getAllCategory();
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Category retrieved successfully!',
      data: category,
    });
});


export const CategoryController = {
    createCategory,
    updateCategory,
    getAllCategory

 };
