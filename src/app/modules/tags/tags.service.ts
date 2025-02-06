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
    company: Types.ObjectId
  ) => {
    // Check if the tag exists
    const tag = await Tags.findById(id);
    if (!tag) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Tag not found');
    }
  
    // Check if the company already exists in the tag
    const companyExists = tag?.companies.includes(company);
  
    let updatedTag;
    if (companyExists) {
      // Remove the company from the tag
      updatedTag = await Tags.findByIdAndUpdate(
        id,
        { $pull: { companies: company } },
        { new: true }
      );
    } else {
      // Add the company to the tag
      updatedTag = await Tags.findByIdAndUpdate(
        id,
        { $addToSet: { companies: company } },
        { new: true }
      );
    }
  
    if (!updatedTag) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update tag');
    }
  
    return updatedTag;
  };



  const getAllTags = async () => {
    const tags = await Tags.find();
    return tags;
  };

export const TagsServices = { createTag, updateTag, deleteTag, addCustomerOrRemoveFromTag, getAllTags };
