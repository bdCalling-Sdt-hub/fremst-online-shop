import { Request, Response, NextFunction } from 'express';
import { NotificationServices } from './notification.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';

const getAllNotification = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const notifications = await NotificationServices.getAllNotification(user);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Notifications fetched successfully',
        data: notifications,
    })
})

const getSingleNotification = catchAsync(async (req: Request, res: Response) => {
    const notification = await NotificationServices.getSingleNotification(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Notification fetched successfully',
        data: notification,
    })
})

export const NotificationController = { getAllNotification, getSingleNotification };
