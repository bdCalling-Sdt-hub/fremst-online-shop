import { Model, Types } from 'mongoose';

export type ITags = {
  name: string;
  rate: number;
  companies: Types.ObjectId[];
  products: Types.ObjectId[];
};

export type TagsModel = Model<ITags>;
