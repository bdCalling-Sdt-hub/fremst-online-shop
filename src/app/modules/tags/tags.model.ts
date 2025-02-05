import { Schema, model } from 'mongoose';
import { ITags, TagsModel } from './tags.interface'; 

const tagsSchema = new Schema<ITags, TagsModel>({
  // Define schema fields here
});

export const Tags = model<ITags, TagsModel>('Tags', tagsSchema);
