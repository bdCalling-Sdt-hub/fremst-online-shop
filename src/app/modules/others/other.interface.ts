import { Model, Types } from "mongoose";

export type IOthers = {
   _id: Types.ObjectId;
   content: string;
   type: string;

   createdAt: Date;
   updatedAt: Date;
};

export type IOthersModel = Model<IOthers>;


export type IFaq = {
   _id: Types.ObjectId;

      question: string;
      answer: string;

   createdAt: Date;
   updatedAt: Date;
}

export type IFaqModel = Model<IFaq>;
