import { Schema, model } from 'mongoose';
import { ICategory, CategoryModel } from './category.interface'; 

const categorySchema = new Schema<ICategory, CategoryModel>({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  image : {
    type: String,
    required: true,
  },
  // subCategories: [
  //   {
  //     type: Schema.Types.ObjectId,
  //     ref: 'Subcategory',
  //   },
  // ],
}, {
  timestamps: true,
});

export const Category = model<ICategory, CategoryModel>('Category', categorySchema);
