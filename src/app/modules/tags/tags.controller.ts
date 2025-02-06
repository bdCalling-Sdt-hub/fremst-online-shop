import { Request, Response, NextFunction } from 'express';
import { TagsServices } from './tags.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';

const createTag = catchAsync(async (req: Request, res: Response) => {
    const tag = await TagsServices.createTag(req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Tag created successfully!',
        data: tag,
    });
});

const updateTag = catchAsync(async (req: Request, res: Response) => {
    const tag = await TagsServices.updateTag(new Types.ObjectId(req.params.id), req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Tag updated successfully!',
        data: tag,
    });
});

const deleteTag = catchAsync(async (req: Request, res: Response) => {
    const tag = await TagsServices.deleteTag(new Types.ObjectId(req.params.id));
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Tag deleted successfully!',
        data: tag,
    });
});

const addCustomerOrRemoveFromTag = catchAsync(async (req: Request, res: Response) => {
    const { tagId, customer } = req.body;
    const tag = await TagsServices.addCustomerOrRemoveFromTag(new Types.ObjectId(tagId), new Types.ObjectId(customer));
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Customer added to tag successfully!',
        data: tag,
    });
});

const getAllTags = catchAsync(async (req: Request, res: Response) => {
    const tags = await TagsServices.getAllTags();
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Tags retrieved successfully!',
        data: tags,
    });
});

export const TagsController = { createTag, updateTag, deleteTag, addCustomerOrRemoveFromTag, getAllTags };
