import { Request, Response } from 'express';
import { OrderService } from './order.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { IOrder } from './order.interface';
import { USER_ROLES } from '../../../enum/user';
import pick from '../../../shared/pick';
import { paginationFields } from '../../../interfaces/pagination';
import { orderFilterableFields } from './order.constants';
import { Types } from 'mongoose';

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
    req.params.status as 'delivered' | 'cancelled'
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


const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, orderFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);
  const result = await OrderService.getAllOrders(filters, paginationOptions);
  
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Orders retrieved successfully',
    data: result,
  });
});


const getSingleOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await OrderService.getSingleOrder(new Types.ObjectId(req.params.id));
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order retrieved successfully',
    data: order,
  });
});

const getOrdersByEmployeeAndCompany = catchAsync(async (req: Request, res: Response) => {
  const { employeeId, companyId } = req.query;
  const filters = pick(req.query, orderFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);

  const orders = await OrderService.getOrderForEmployeeAndCompany(req.user,  filters, paginationOptions,employeeId as string , companyId as string);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Orders retrieved successfully',
    data: orders,
  });
});

export const OrderController = {
  createOrder,
  updateOrderStatus,
  getYearlyOrderStats,
  getAllOrders,
  getSingleOrder,
  getOrdersByEmployeeAndCompany
};
