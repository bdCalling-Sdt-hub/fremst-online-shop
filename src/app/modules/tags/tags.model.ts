import { Schema, model } from 'mongoose';
import { ITags, TagsModel } from './tags.interface'; 

const tagsSchema = new Schema<ITags, TagsModel>({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
  },
  companies: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Company',
    },
  ],
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
},{timestamps:true});

export const Tags = model<ITags, TagsModel>('Tags', tagsSchema);
