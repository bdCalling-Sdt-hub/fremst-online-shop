
// import { JwtPayload } from 'jsonwebtoken';
// import { Cart } from './cart.model';
// import { ICart } from './cart.interface';
// import ApiError from '../../../errors/ApiError';
// import { StatusCodes } from 'http-status-codes';
// import { Types } from 'mongoose';

// const addToCart = async (cartData: ICart, user:JwtPayload) => {
//   const cart = await Cart.findOne({ employee: user.userId });
//   if (!cart) {
//     const newCart = new Cart({ employee: user.userId, products: [cartData] });
//     await newCart.save();
//     return newCart;
//   }
//   await Cart.findOneAndUpdate({ employee: user.userId }, { $push: { products: cartData } });
//   return cart;
// }

// const removeProductFromCart = async (removedProduct: Types.ObjectId, user:JwtPayload) => {
//   const cart = await Cart.findOne({ employee: user.userId });
//   if (!cart) {
//     throw new ApiError(StatusCodes.NOT_FOUND, 'Cart not found');
//   }
//   await Cart.findOneAndUpdate({ employee: user.userId }, { $pull: { products: removedProduct } });
//   return cart;
// }

// const deleteCart = async (user:JwtPayload) => {
//   const cart = await Cart.findOne({ employee: user.userId });
//   if (!cart) {
//     throw new ApiError(StatusCodes.NOT_FOUND, 'Cart not found');
//   }
//   await cart.deleteOne();
// }


// const getCartByUser = async (user:JwtPayload) => {
//   const cart = await Cart.findOne({ employee: user.userId }).populate('products.product');
//   if (!cart) {
//     throw new ApiError(StatusCodes.NOT_FOUND, 'Cart not found');
//   }
//   return cart;
// }

// export const CartServices = { createOrUpdateCart, deleteCart, getCartByUser };
