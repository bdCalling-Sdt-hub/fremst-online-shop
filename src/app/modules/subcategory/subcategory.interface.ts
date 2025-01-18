import { Model } from 'mongoose';

export type ISubcategory = {
  title: string;
  slug: string;
  image: string;
  categories: string[];
};

export type SubcategoryModel = Model<ISubcategory>;
