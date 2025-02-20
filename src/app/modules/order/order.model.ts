import { Schema, model } from 'mongoose';
import { IOrder } from './order.interface';

const orderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    pickup:{
      type: Boolean,
      required: true,
      default: false  
    },
    items: [
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
        price: {
          type: Number,
          required: true,
        },
        color: {
          type: String,
    
        },
        size: {
          type: String,
  
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'dispatched'],
      default: 'pending',
    },
    additionalInfo: {
      type: String,
    },
    address: {
      _id: false,
      streetAddress: { type: String },
      city: { type: String },
      postalCode: { type: String },
    },
    contact: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Order = model<IOrder>('Order', orderSchema);
