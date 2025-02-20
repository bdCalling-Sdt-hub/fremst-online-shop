import { Schema, model } from 'mongoose';
import { ITags, TagsModel } from './tags.interface'; 

const tagsSchema = new Schema<ITags, TagsModel>({

},{timestamps:true});

export const Tags = model<ITags, TagsModel>('Tags', tagsSchema);
