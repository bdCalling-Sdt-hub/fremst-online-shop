import { Schema, model } from 'mongoose';
import { ISubcategory, SubcategoryModel } from './subcategory.interface'; 

const subcategorySchema = new Schema<ISubcategory, SubcategoryModel>({
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
  categories: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
  ],
}, {
  timestamps: true,
});

export const Subcategory = model<ISubcategory, SubcategoryModel>('Subcategory', subcategorySchema);
