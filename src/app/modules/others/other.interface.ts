import { Model, Types } from "mongoose";

export type IOthers = {
   _id: Types.ObjectId;
   content: string;
   createdAt: Date;
   type: string;
   updatedAt: Date;
};

export type IOthersModel = Model<IOthers>;



