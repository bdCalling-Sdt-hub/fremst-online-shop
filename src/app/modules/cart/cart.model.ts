import { Schema, model } from 'mongoose';
import { ICart, CartModel } from './cart.interface'; 

const cartSchema = new Schema<ICart, CartModel>({
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  products: [
    {
      _id:false,
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      size: {
        type: String,
        required: true,
      },
      color: {
        type: String,
        required: true,
      },
    },
  ],

},{timestamps:true});

export const Cart = model<ICart, CartModel>('Cart', cartSchema);
