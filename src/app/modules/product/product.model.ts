import { Schema, model } from 'mongoose';
import { IProduct, PRODUCT_SIZE, ProductModel } from './product.interface'; 

const productSchema = new Schema<IProduct, ProductModel>({
  
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  additionalInfo: {
    type: String,
    required: true,
  },
  sizes: {
    type: [String],
    required: true,
  },
  colors: {
    type: [String],
    required: true,
  },
  salePrice: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  featuredImages: {
    type: [String],
    required: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  // subcategory: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'Subcategory',
  //   required: true,
  // },
  quantity: {
    type: Number,
    required: true,
  },
  totalSales: {
    type: Number,
    required: true,
    default: 0,
  },
  brands: {
    type: [String],
    required: true,
  },
  tags: {
    type: [String],
    required: true,
  },
  availability: {
    type: Boolean,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },  

}, {
  timestamps: true,
});

export const Product = model<IProduct, ProductModel>('Product', productSchema);
