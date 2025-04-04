import { Model, Types } from 'mongoose';

export enum PRODUCT_SIZE {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = '2XL',
  XXXL = '3XL',

}

export type IProduct = {
  _id: Types.ObjectId;
  name: string;
  price: number;
  description: string;
  status:'deleted' | 'active';
  additionalInfo: string;
  sizes: string[];
  colors: string[];
  salePrice: number;
  image: string;
  featuredImages: string[];
  category: Types.ObjectId;
  // subcategory: Types.ObjectId;
  quantity: number;
  brands: string[];
  tags: string[];
  availability: boolean;
  totalSales: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductModel = Model<IProduct>;


export type IProductFilters = {
  searchTerm?: string;
  category?: string;
  subcategory?: string;
  company?:string;
  brand?: string;
  tag?: string;
  sizes?: string;
  colors?: string;

  minPrice?: number;
  maxPrice?: number;
};