import { Schema, model } from 'mongoose';
import { ICprice, CpriceModel } from './cprice.interface'; 

const cpriceSchema = new Schema<ICprice, CpriceModel>({
  company:{
    type: Schema.Types.ObjectId,
    required:true
  },
   product:{
     type: Schema.Types.ObjectId,
     required:true,
   },
  price:{
     type: Number,
    required:true
  }



}, {timestamps:true});

export const Cprice = model<ICprice, CpriceModel>('Cprice', cpriceSchema);
