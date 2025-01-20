import { Request, Response, NextFunction } from 'express';
import { EmployeeServices } from './employee.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const getEmployeeProfile = catchAsync(async (req: Request, res: Response) => {
    const employee = await EmployeeServices.getEmployeeProfileFromDB(req.user);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Employee profile retrieved successfully!',
        data: employee,
    });
});


export const EmployeeController = { 
    getEmployeeProfile,

};
