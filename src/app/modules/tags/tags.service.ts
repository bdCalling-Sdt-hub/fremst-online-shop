import { Types } from 'mongoose';
import { TagsModel } from './tags.interface';
import { Tags } from './tags.model';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';

const createTag = async (payload: { name: string ; rate: number }) => {
    const tag = await Tags.create(payload);
    return tag;
};

const updateTag = async (id: Types.ObjectId, payload: { name: string ; rate: number }) => {
    const tag = await Tags.findByIdAndUpdate(id, payload, { new: true });
    return tag;
};

const deleteTag = async (id: Types.ObjectId) => {
    const tag = await Tags.findByIdAndDelete(id);
    return tag;
};

const addCustomerOrRemoveFromTag = async (
    id: Types.ObjectId,
    companies: Types.ObjectId[]
  ) => {
    // Check if the tag exists
    const tag = await Tags.findById(id);
    if (!tag) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Tag not found');
    }
  

    const companyExist = tag?.companies.map((company) => company.toString()).includes(companies.toString());

    let updatedTag;

    if (companyExist) {
      // Remove the company from the tag
      updatedTag = await Tags.findByIdAndUpdate(
        id,
        { $pull: { companies: { $in: companies } } },
        { new: true }
      );
    } else {
      // Add the company to the tag
      updatedTag = await Tags.findByIdAndUpdate(
        id,
        { $addToSet: { companies: { $each: companies } } },
        { new: true }
      );
    }
  
    if (!updatedTag) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update tag');
    }
  
    return updatedTag;
  };


  const addOrRemoveProductFromTag = async (
    id: Types.ObjectId,
    products: Types.ObjectId[]
  ) => {
    // Check if the tag exists
    const tag = await Tags.findById(id);
    if (!tag) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Tag not found');
    }
  
    // Check if the product already exists in the tag
    const productExists = tag?.products.some((product) => products.toString().includes(product.toString()));
    console.log(productExists, "productExists")
    let updatedTag;
    if (productExists) {
      // Remove the product from the tag
      updatedTag = await Tags.findByIdAndUpdate(
        id,
        { $pull: { products: { $in: products } } },
        { new: true }
      );
    } else {
      // Add the product to the tag
      updatedTag = await Tags.findByIdAndUpdate(
        id,
        { $addToSet: { products: { $each: products } } },
        { new: true }
      );
    }
  
    if (!updatedTag) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update tag');
    }
  
    return updatedTag;
  };


  const getAllTags = async () => {
    const tags = await Tags.find().populate({
        path:'companies',
        select:'_id',
        populate:{
            path:'user',
            select:'_id name'
        }
    } ).populate('products', {_id:1, name:1});
    return tags;
  };

export const TagsServices = { createTag, updateTag, deleteTag, addCustomerOrRemoveFromTag, addOrRemoveProductFromTag, getAllTags };
