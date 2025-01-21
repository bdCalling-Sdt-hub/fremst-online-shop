import { Request, Response } from 'express';
import { OrderService } from './order.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { IOrder } from './order.interface';
import { USER_ROLES } from '../../../enum/user';

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await OrderService.createOrder(req.user, req.body);
  sendResponse<IOrder>(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Order created successfully',
    data: order,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const order = await OrderService.updateOrderStatus(
    req.user,
    req.params.id,
    req.body
  );
  sendResponse<IOrder>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order status updated successfully',
    data: order,
  });
});

const getYearlyOrderStats = catchAsync(async (req: Request, res: Response) => {
  const year = Number(req.params.year) || new Date().getFullYear();
  let { companyId, employeeId } = req.query;

  // assign company id or employee id if not provided from req.user
  if (!companyId && !employeeId) {
    if (req.user.role === USER_ROLES.EMPLOYEE) {
      employeeId = req.user.userId;
    } else if (req.user.role === USER_ROLES.COMPANY) {
      companyId = req.user.userId;
    }
  }

  const result = await OrderService.getYearlyOrderStats(year, {
    companyId: companyId?.toString(),
    employeeId: employeeId?.toString(),
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Yearly order statistics retrieved successfully',
    data: result,
  });
});

export const OrderController = {
  createOrder,
  updateOrderStatus,
  getYearlyOrderStats,
};
