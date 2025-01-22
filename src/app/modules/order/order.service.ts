import { JwtPayload } from 'jsonwebtoken';
import mongoose, { SortOrder, Types } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { IOrder, IOrderFilterableFields, IOrderItem, IUpdateOrderStatus } from './order.interface';
import { Order } from './order.model';
import { Employee } from '../employee/employee.model';
import { Product } from '../product/product.model';
import { IUser } from '../user/user.interface';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { orderSearchableFields } from './order.constants';
import { IGenericResponse } from '../../../interfaces/response';
import { generateOrderId } from './order.utils';
import { Company } from '../company/company.model';

interface IMonthlyOrderStats {
  month: number;
  totalOrders: number;
  totalAmount: number;
}

interface IYearlyOrderStats {
  year: number;
  monthlyStats: IMonthlyOrderStats[];
  totalOrders: number;
  totalAmount: number;
}

const createOrder = async (
  user: JwtPayload,
  payload: IOrder
): Promise<IOrder> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get employee details and verify budget
    const employee = await Employee.findById(user.userId,{user: 1, budgetLeft: 1, company: 1}).populate<{user:IUser}>('user', { name: 1, email: 1, address: 1, contact: 1, status: 1 }).session(session);
    if (!employee) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Employee not found or budget details missing.');
    }

    //assign custom order id 
    const orderId = await generateOrderId();
   

    // Calculate total amount and verify products
    const orderItems: IOrderItem[] = [];
    let totalAmount = 0;

    for (const item of payload.items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          `Product not found with id: ${item.product}`
        );
      }

      if (product.quantity < item.quantity) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Insufficient stock for product: ${product.name}`
        );
      }

      const itemTotal = product.salePrice
        ? product.salePrice * item.quantity
        : product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.salePrice || product.price,
      });

    }
    
    // Update product quantity and total sales
    const bulkUpdates = payload.items.map(item => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.quantity, totalSales: item.quantity } },
        },
      }));


      await Product.bulkWrite(bulkUpdates, { session });

      await Company.findOneAndUpdate(
        { _id: employee.company },
        { $inc: {  totalOrders: 1, totalSpentBudget: totalAmount } },
        { session }
      );

    // Check if employee has sufficient budget
    const employeeUpdateResult = await Employee.findOneAndUpdate(
        {
          _id: employee._id,
          budgetLeft: { $gte: totalAmount }, // Ensure sufficient budget
        },
        {
          $inc: {
            budgetLeft: -totalAmount,
            totalSpentBudget: totalAmount,
            totalOrders: 1,
          },
        },
        { session, new: true }
      );
      
      if (!employeeUpdateResult) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Insufficient budget for this order'
        );
      }
    // Create order
    const order = await Order.create(
        [
          {
            orderId,
            employee: employee._id,
            company: employee.company,
            items: orderItems,
            totalAmount,
            address: payload.address || employee.user.address,
            contact: employee.user.contact,
            name: employee.user.name,
            additionalInfo: payload.additionalInfo,
          },
        ],
        { session }
      );
    await session.commitTransaction();
    return order[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};


const updateOrderStatus = async (
  user: JwtPayload,
  orderId: string,
  status: 'delivered' | 'cancelled'
): Promise<IOrder> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const order = await Order.findById(orderId).session(session);
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
    }

    if (order.status !== 'pending') {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Cannot update status of non-pending order'
      );
    }

    // If cancelling order, restore product quantities and employee budget
    if (status === 'cancelled') {
      // Restore product quantities
      const productUpdates = order.items.map(item => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: item.quantity, totalSales: -item.quantity } },
        },
      }));
      await Product.bulkWrite(productUpdates, { session });

      // Restore employee budget
      await Employee.findByIdAndUpdate(
        order.employee,
        {
          $inc: {
            budgetLeft: order.totalAmount,
            totalSpentBudget: -order.totalAmount,
            totalOrders: -1,
          },
        },
        { session }
      );

      await Company.findByIdAndUpdate(
        order.company,
        { $inc: { totalOrders: -1, totalSpentBudget: -order.totalAmount } },
        { session }
      );

    }
    

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: status },
      { new: true, session }
    );  

    if (!updatedOrder) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update order');
    }

    await session.commitTransaction();
    return updatedOrder;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getSingleOrder = async (orderId: Types.ObjectId): Promise<IOrder> => {
  const order = await Order.findById(orderId)
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
  }
  return order;
};

const getAllOrders = async (filters:IOrderFilterableFields, paginationOptions:IPaginationOptions): Promise<IGenericResponse<IOrder[]>> => {
    const {searchTerm, ...filtersData} = filters;
    const {page, limit, skip, sortBy, sortOrder} =  paginationHelper.calculatePagination(paginationOptions);

    const andConditions = [];

    if(searchTerm){
     orderSearchableFields.forEach(field => {
        andConditions.push({
           $or: [
                { [field]: { $regex: searchTerm, $options: 'i' } }
            ]
        })
     })   
    }

    if(Object.keys(filtersData).length){
        andConditions.push({
            $and: Object.entries(filtersData).map(([field, value]) => ({
                [field]: value
            }))
        })
    }

    const sortCondition: { [key: string]: SortOrder } = {};

    if (sortBy && sortOrder) {
        sortCondition[sortBy] = sortOrder;
    }

    const whereConditions = andConditions.length > 0 ? { $and: andConditions } : {};

    const result = await Order.find(whereConditions)
    .populate('items.product',{name: 1, salePrice: 1, price: 1, sizes: 1, colors: 1, quantity: 1})
    .sort(sortCondition)
    .skip(skip)
    .limit(limit)

    const total = await Order.countDocuments(whereConditions);
    return {
        meta: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit)
        },
        data: result
    }
};

const getYearlyOrderStats = async (
  year: number,
  filter: { companyId?: string; employeeId?: string }
): Promise<IYearlyOrderStats> => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  // Base match condition for the year
  const matchCondition: any = {
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
    status: { $ne: 'cancelled' }, // Exclude cancelled orders
  };

  // Add company or employee filter
  if (filter.companyId) {
    matchCondition.company = new Types.ObjectId(filter.companyId);
  }
  if (filter.employeeId) {
    matchCondition.employee = new Types.ObjectId(filter.employeeId);
  }

  const monthlyStats = await Order.aggregate([
    {
      $match: matchCondition,
    },
    {
      $group: {
        _id: { month: { $month: '$createdAt' } },
        totalOrders: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
      },
    },
    {
      $project: {
        _id: 0,
        month: '$_id.month',
        totalOrders: 1,
        totalAmount: 1,
      },
    },
    {
      $sort: { month: 1 },
    },
  ]);

  // Fill in missing months with zero values
  const completeMonthlyStats: IMonthlyOrderStats[] = Array.from({ length: 12 }, (_, i) => {
    const existingMonth = monthlyStats.find(stat => stat.month === i + 1);
    return existingMonth || {
      month: i + 1,
      totalOrders: 0,
      totalAmount: 0,
    };
  });

  // Calculate yearly totals
  const yearlyTotals = completeMonthlyStats.reduce(
    (acc, month) => ({
      totalOrders: acc.totalOrders + month.totalOrders,
      totalAmount: acc.totalAmount + month.totalAmount,
    }),
    { totalOrders: 0, totalAmount: 0 }
  );

  return {
    year,
    monthlyStats: completeMonthlyStats,
    totalOrders: yearlyTotals.totalOrders,
    totalAmount: yearlyTotals.totalAmount,
  };
};

export const OrderService = {
  createOrder,
  updateOrderStatus,
  getSingleOrder,
  getAllOrders,
  getYearlyOrderStats,
};
