import { Request, Response, NextFunction } from 'express';
import { SubcategoryServices } from './subcategory.service';
import catchAsync from '../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';

const createSbCategory = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    if (req.files && 'image' in req.files && req.files.image.length > 0) {
        payload.image = `/images/${req.files.image[0].filename}`
    }
    const category = await SubcategoryServices.createSubcategory(payload);
   sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Subcategory created successfully!',
      data: category,
    });
});



const updateSubcategory = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    if (req.files && 'image' in req.files && req.files.image.length > 0) {
        payload.image = `/images/${req.files.image[0].filename}`
    }
    const category = await SubcategoryServices.updateSubcategory(req.params.id, payload);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Subcategory updated successfully!',
      data: category,
    });
});
export const SubcategoryController = { 
    createSbCategory,
    updateSubcategory
};
