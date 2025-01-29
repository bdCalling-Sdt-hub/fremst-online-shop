import { Model, Types } from 'mongoose';

type CartItem = {
 product:Types.ObjectId
 quantity:number
 size:string
 color:string

}

export type ICart = {
  _id:Types.ObjectId
  employee:Types.ObjectId
  products:CartItem[]
  createdAt:Date
  updatedAt:Date
  
};

export type CartModel = Model<ICart>;
