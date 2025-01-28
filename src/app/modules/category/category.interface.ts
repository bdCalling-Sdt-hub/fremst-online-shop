import { Model, Types } from 'mongoose';

export type ICategory = {
  _id:Types.ObjectId
  title: string;
  slug: string;
  image: string;
  // subCategories: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryModel = Model<ICategory>;
