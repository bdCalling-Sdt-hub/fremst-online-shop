// import { Request, Response, NextFunction } from 'express';
// import { CartServices } from './cart.service';
// import catchAsync from '../../../shared/catchAsync';
// import sendResponse from '../../../shared/sendResponse';
// import { StatusCodes } from 'http-status-codes';
// import { Types } from 'mongoose';


// const addToCart = catchAsync(async (req: Request, res: Response) => {
//     const cartData = req.body;
//     const user = req.user;
//     await CartServices.addToCart(cartData, user);
//     sendResponse(res, {
//         statusCode: StatusCodes.OK,
//         success: true,
//         message: 'Cart updated successfully',
//         data: null,
//     })
// })

// const removeProductFromCart = catchAsync(async (req: Request, res: Response) => {
//     const {id} = req.params;
//     const user = req.user;
//     await CartServices.removeProductFromCart(new Types.ObjectId(id), user);
//     sendResponse(res, {
//         statusCode: StatusCodes.OK,
//         success: true,
//         message: 'Product removed from cart successfully',
//         data: null,
//     })
// })

// const deleteCart = catchAsync(async (req: Request, res: Response) => {
//     const user = req.user;
//     await CartServices.deleteCart(user);
//     sendResponse(res, {
//         statusCode: StatusCodes.OK,
//         success: true,
//         message: 'Cart deleted successfully',
//         data: null,
//     })
// })

// const getCartByUser = catchAsync(async (req: Request, res: Response) => {
//     const user = req.user;
//     const cart = await CartServices.getCartByUser(user);
//     sendResponse(res, {
//         statusCode: StatusCodes.OK,
//         success: true,
//         message: 'Cart retrieved successfully',
//         data: cart,
//     })
// })

// export const CartController = { addToCart, removeProductFromCart, deleteCart, getCartByUser };
