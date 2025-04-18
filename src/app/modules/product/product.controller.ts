import { Request, Response } from 'express';
import { ProductServices } from './product.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { productFilterableFields } from './product.constants';
import pick from '../../../shared/pick';
import { paginationFields } from '../../../interfaces/pagination';

const createProduct = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user;

    if(req.files && 'image' in req.files && req.files.image.length > 0){
        payload.image = `/images/${req.files.image[0].filename}`
    }

    if(req.files && 'featuredImage' in req.files && req.files.featuredImage.length > 0){
        payload.featuredImages = req.files.featuredImage.map((file) => `/featuredImage/${file.filename}`);
    }

    const product = await ProductServices.createProduct(payload, user);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Product created successfully!',
      data: product,
    });
});


const updateProduct = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;



    if(req.files && 'image' in req.files && req.files.image.length > 0){
        payload.image = `/images/${req.files.image[0].filename}`
    }

    if(req.files && 'featuredImage' in req.files && req.files.featuredImage.length > 0){
        payload.featuredImages = req.files.featuredImage.map((file) => `/featuredImage/${file.filename}`);
    }

    const product = await ProductServices.updateProduct(new Types.ObjectId(req.params.id), payload);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Product updated successfully!',
      data: product,
    });
});


const deleteProduct = catchAsync(async (req: Request, res: Response) => {
    const product = await ProductServices.deleteProduct(new Types.ObjectId(req.params.id));
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Product deleted successfully!',
      data: product,
    });
});


const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
    const product = await ProductServices.getSingleProduct(new Types.ObjectId(req.params.id),req.user);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Product retrieved successfully!',
      data: product,
    });
});


const getAllProduct = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, productFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const product = await ProductServices.getAllProduct(req.user,filters, paginationOptions);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Product retrieved successfully!',
      data: product,
    });
});

export const ProductController = {
    createProduct,
    updateProduct,
    deleteProduct,
    getSingleProduct,
    getAllProduct
 };
