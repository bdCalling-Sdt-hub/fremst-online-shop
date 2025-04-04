import { JwtPayload } from 'jsonwebtoken';
import mongoose, { SortOrder, Types } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { IOrder, IOrderFilterableFields, IOrderItem } from './order.interface';
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
import { socketDataAndNotificationHelper } from '../../../helpers/socketNotificationAndDataHelper';
import config from '../../../config';
import { emailTemplate } from '../../../shared/emailTemplate';
import { emailHelper } from '../../../helpers/emailHelper';
import { USER_ROLES } from '../../../enum/user';
import { Cprice } from '../cprice/cprice.model'


type IMonthlyOrderStats ={
  month: number;
  totalOrders: number;
  totalAmount: number;
}

type IYearlyOrderStats ={
  year: number;
  monthlyStats: IMonthlyOrderStats[];
  totalOrders: number;
  totalAmount: number;
}



const createOrder = async (user: JwtPayload, payload: IOrder): Promise<IOrder> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate payload items
    if (!payload.items || payload.items.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Order items cannot be empty.');
    }

    // Get employee details and verify budget
    const employee = await Employee.findById(user.userId, { user: 1, budgetLeft: 1, company: 1 })
      .populate<{ user: IUser }>('user', { name: 1, email: 1, address: 1, contact: 1, status: 1 })
      .session(session);

    if (!employee) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Employee not found or budget details missing.');
    }

    if (!employee.user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User details not found for the employee.');
    }

    // Assign custom order ID
    const orderId = await generateOrderId();

    // Calculate total amount and verify products
    const orderItems: IOrderItem[] = [];
    let totalAmount = 0;



    const productValidationPromises = payload.items.map(async (item) => {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        throw new ApiError(StatusCodes.NOT_FOUND, `Product not found with id: ${item.product}`);
      }
      if (product.quantity < item.quantity) {
        throw new ApiError(StatusCodes.BAD_REQUEST, `Insufficient stock for product: ${product.name}`);
      }

       // Check if the product will be out of stock after this order
       if (product.quantity - item.quantity === 0) {
        product.availability = false; // Mark the product as unavailable
      }

      // Get the price from the Cprice collection, based on the employee's company
      const cprice = await Cprice.findOne({ company: employee.company, product: item.product }).session(session);

      let itemPrice: number;

      if (cprice) {
        // Use the price from Cprice if available
        itemPrice = cprice.price;
      } else {
        // Fallback to the product's sale price, and then to the regular price if sale price is not available
        itemPrice = product.salePrice ?? product.price;
      }

      if (typeof itemPrice !== 'number' || itemPrice <= 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, `Invalid price for product: ${product.name}`);
      }

      const itemTotal = itemPrice * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: itemPrice,
        color: item.color,
        size: item.size,
      });

      // Save the updated product status if it's marked as unavailable
      if (product.availability === false) {
        await product.save({ session });
      }
    });

    

    await Promise.all(productValidationPromises);



    // Update product quantity and total sales
    const bulkUpdates = payload.items.map((item) => ({
      updateOne: {
        filter: { _id: item.product, quantity: { $gte: item.quantity } },
        update: { $inc: { quantity: -item.quantity, totalSales: item.quantity } },
      },
    }));

    await Product.bulkWrite(bulkUpdates, { session });

    // Update company total orders and total spent budget
    await Company.findOneAndUpdate(
      { _id: employee.company },
      { $inc: { totalOrders: 1, totalSpentBudget: totalAmount } },
      { session }
    );

    // Check if employee has sufficient budget
    const employeeUpdateResult = await Employee.findOneAndUpdate(
      {
        _id: employee._id,
        budgetLeft: { $gte: totalAmount },
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
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Insufficient budget for this order');
    }

    // Create order
    const address = payload.address !== undefined ? payload.address : employee.user.address;
    const order = await Order.create(
      [
        {
          orderId,
          employee: employee._id,
          company: employee.company,
          items: orderItems,
          totalAmount,
          address,
          contact: employee.user.contact,
          name: payload.name || employee.user.name,
          additionalInfo: payload.additionalInfo,
          status: 'pending',
        },
      ],
      { session }
    );

    const adminNotification = {
      nameSpace: 'notification',
      title: `New Order - ${orderId} placed by ${order[0].name}`,
      description: `Order - ${orderId} placed by ${order[0].name} at ${order[0].address.streetAddress}, ${order[0].address.city}, ${order[0].address.postalCode} on ${order[0].createdAt.toDateString()} has been placed. Please review and process the order.`,
      type: USER_ROLES.ADMIN,
      recipient: config.admin_order_receiving_code || "admin",
    };

    const companyNotification = {
      nameSpace: 'notification',
      title: `New Order - ${orderId} placed by ${order[0].name}`,
      description: `Order - ${orderId} placed by your employee name: ${order[0].name} on ${order[0].createdAt.toDateString()} has been placed.`,
      type: 'order',
      user: employee.company,
      recipient: employee.company.toString(),
    };
    
    // Send both notifications in parallel
    await Promise.all([
      socketDataAndNotificationHelper.sendNotification(adminNotification),
      socketDataAndNotificationHelper.sendNotification(companyNotification),
    ]);




    const getPopulatedOrder = await Order.findById(order[0]._id).populate('items.product').session(session);

    const orderDetails = {
      email: user.email,
      orderNumber: getPopulatedOrder!.orderId,
      customerName: getPopulatedOrder!.name,
      items: getPopulatedOrder!.items.map((item: any) => ({ name: item.product.name, quantity: item.quantity, price: item.price, color: item.color, size: item.size })),
      subtotal: getPopulatedOrder!.totalAmount,
      tax: 0, // Calculate tax based on order items
      total: getPopulatedOrder!.totalAmount,
      shippingAddress: getPopulatedOrder!.address.city+", "+getPopulatedOrder!.address.streetAddress+", "+getPopulatedOrder!.address.postalCode,
    };

     await emailHelper.sendEmail(emailTemplate.orderConfirmation(orderDetails));
    const orderDetails2 = {
      ...orderDetails,
      email: "info@fremst.se",
      type:'admin'
    }
    await emailHelper.sendEmail(emailTemplate.orderConfirmation(orderDetails2));
  
    await session.commitTransaction();



    return order[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const updateOrderStatus = async (
  user: JwtPayload,
  orderId: string,
  status: 'completed' | 'cancelled' | 'dispatched' | 'pending'
): Promise<IOrder> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId)
      .populate<{ employee: { user: Partial<IUser> } }>({
        path: 'employee',
        select: '_id',
        populate: {
          path: 'user',
          select: { email: 1 },
        },
      })
      .session(session);

    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
    }

    // 1. If order is already cancelled, do not allow any other status update
    if (order.status === 'cancelled' && status !== 'cancelled') {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Cannot change status of a cancelled order'
      );
    }

    // 2. Without being dispatched it cannot be marked as completed
    if (status === 'completed' && order.status !== 'dispatched') {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Order must be dispatched before it can be marked as completed.'
      );
    }


    const orderDetails = {
      email: order.employee.user.email!,
      orderNumber: order.orderId,
      customerName: order.name,
      items: order.items.map((item: any) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        color: item.color,
        size: item.size,
      })),
      subtotal: order.totalAmount,
      tax: 0, // Set your tax logic
      total: order.totalAmount,
      shippingAddress:
        order.address.city +
        ', ' +
        order.address.streetAddress +
        ', ' +
        order.address.postalCode,
      type: 'customer',
      status: status
    };

    // If cancelling order, restore product quantities and employee budget
    if (status === 'cancelled') {
      const productUpdates = order.items.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: [
            // First stage: Increment quantity and totalSales
            {
              $set: {
                quantity: { $add: ["$quantity", item.quantity] },
                totalSales: { $add: ["$totalSales", -item.quantity] },
              },
            },
            // Second stage: Update availability based on the new quantity
            {
              $set: {
                availability: {
                  $cond: {
                    if: { $gt: ["$quantity", 0] }, // Uses the updated quantity
                    then: true,
                    else: false,
                  },
                },
              },
            },
          ],
        },
      }));
      await Product.bulkWrite(productUpdates, { session });

      // Restore employee budget with validation
      const employeeUpdateResult = await Employee.findOneAndUpdate(
        {
          _id: order.employee,
          totalSpentBudget: { $gte: order.totalAmount },
          totalOrders: { $gte: 1 },
        },
        {
          $inc: {
            budgetLeft: order.totalAmount,
            totalSpentBudget: -order.totalAmount,
            totalOrders: -1,
          },
        },
        { session, new: true }
      );

      if (!employeeUpdateResult) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Failed to restore employee budget due to insufficient total spent budget or total orders'
        );
      }

      // Restore company budget with validation
      const companyUpdateResult = await Company.findOneAndUpdate(
        {
          _id: order.company,
          totalSpentBudget: { $gte: order.totalAmount },
          totalOrders: { $gte: 1 },
        },
        {
          $inc: {
            totalOrders: -1,
            totalSpentBudget: -order.totalAmount,
          },
        },
        { session, new: true }
      );

      if (!companyUpdateResult) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Failed to restore company budget due to insufficient total spent budget or total orders'
        );
      }


    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: status },
      { new: true, session }
    );

    // Send cancellation email
    const orderStatus = emailTemplate.orderStatusUpdate(orderDetails);
    await emailHelper.sendEmail(orderStatus);

    if (!updatedOrder) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update order');
    }

    await session.commitTransaction();
    return updatedOrder;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const getSingleOrder = async (orderId: Types.ObjectId): Promise<IOrder> => {
  const order = await Order.findById(orderId);
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
    .populate({
      path: 'company',
      select: {_id:0, user:1 },
      populate: {
        path: 'user',
        select: {_id:0, name:1, email:1}
      }
    })
    .sort({createdAt: -1})
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

const getOrderForEmployeeAndCompany = async (
  user: JwtPayload,
  filters: Record<string, any>,
  paginationOptions: Record<string, any>,
  employeeId?: string ,
  companyId?: string,
): Promise<IGenericResponse<IOrder[]>> => {

  const id = companyId 
    ? companyId 
    : employeeId 
    ? employeeId 
    : user.userId;
const objectId = new Types.ObjectId(id);
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



andConditions.push({
  $or: [{ company:objectId }, { employee:objectId }],
});


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


export const OrderService = {
  createOrder,
  updateOrderStatus,
  getSingleOrder,
  getAllOrders,
  getYearlyOrderStats,
  getOrderForEmployeeAndCompany
};
