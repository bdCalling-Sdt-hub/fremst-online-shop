import { Model, Types } from 'mongoose'

export type ICprice = {
  _id:Types.ObjectId;
  company:Types.ObjectId
  product:Types.ObjectId;
  price:number
};

export type CpriceModel = Model<ICprice>;
