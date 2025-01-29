import { Request, Response, NextFunction } from 'express';
import { CartServices } from './cart.service';
const createOrUpdateCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cartData = req.body;
        const user = req.user;
        await CartServices.createOrUpdateCart(cartData, user);
        res.status(200).json({ message: 'Cart updated successfully' });
    } catch (error) {
        next(error);
    }
};
const deleteCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        await CartServices.deleteCart(user);
        res.status(200).json({ message: 'Cart deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const getCartByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const cart = await CartServices.getCartByUser(user);
        res.status(200).json(cart);
    } catch (error) {
        next(error);
    }
}
export const CartController = { createOrUpdateCart, deleteCart, getCartByUser };
