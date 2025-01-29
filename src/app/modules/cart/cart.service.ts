
import { JwtPayload } from 'jsonwebtoken';
import { Cart } from './cart.model';
import { ICart } from './cart.interface';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const createOrUpdateCart = async (cartData: ICart, user:JwtPayload) => {
    
    const existingCart = await Cart.findOne({ employee: user.userId });
    if (existingCart) {
      // Update existing cart
      await Cart.findOneAndUpdate({ $set: { ...cartData } });
    } else {
      // Create new cart
        const newCart = await Cart.create({
          employee: user.userId,
          products: cartData.products
        });
        if(!newCart){
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create cart');
        }

    }

}

const deleteCart = async (user:JwtPayload) => {
  const cart = await Cart.findOne({ employee: user.userId });
  if (!cart) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Cart not found');
  }
  await cart.deleteOne();
}


const getCartByUser = async (user:JwtPayload) => {
  const cart = await Cart.findOne({ employee: user.userId }).populate('products.product');
  if (!cart) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Cart not found');
  }
  return cart;
}

export const CartServices = { createOrUpdateCart, deleteCart, getCartByUser };
