import { Schema, model } from 'mongoose';
import { IProduct, ProductModel } from './product.interface'; 

const productSchema = new Schema<IProduct, ProductModel>({
  // Define schema fields here
});

export const Product = model<IProduct, ProductModel>('Product', productSchema);
