import { Types } from 'mongoose';

export type IOrderItem = {
  product: Types.ObjectId;
  quantity: number;
  price: number;
  color: string;
  size: string;
};

type IAddress = {
  streetAddress: string
  city: string
  postalCode: string
}

export type IOrder = {
  _id: Types.ObjectId;
  orderId: string;
  name: string;
  employee: Types.ObjectId;
  company: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'dispatched';
  additionalInfo?: string;
  address: IAddress;
  pickup:boolean;
  contact: string;
  createdAt: Date;
  updatedAt: Date;
};

export type IOrderFilters = {
  searchTerm?: string;
  company?: string;
  employee?: string;
  status?: string;
};

export type IUpdateOrderStatus = {
  status: 'delivered' | 'cancelled';
};



export type IOrderFilterableFields = {
  searchTerm?: string;
  company?: string;
  employee?: string;
  status?: string;
  name?: string;
  additionalInfo?: string;
  address?: string;
  contact?: string;
};