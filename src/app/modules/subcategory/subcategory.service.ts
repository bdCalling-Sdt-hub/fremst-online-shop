import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ISubcategory, SubcategoryModel } from './subcategory.interface';
import { Subcategory } from './subcategory.model';
import { Category } from '../category/category.model';

const createSubcategory = async (payload: ISubcategory & { categoryIds: string[] }): Promise<ISubcategory> => {
  const { categoryIds, ...rest } = payload;
    const uniqueSlug = rest.title.toLowerCase().replace(/\s+/g, '-');
    rest.slug = uniqueSlug;
    const session = await Subcategory.startSession();
    session.startTransaction();
    try {
        rest.categories = categoryIds
      const newSubcategory = await Subcategory.create([rest], { session });
      if(!newSubcategory){
        throw new ApiError(StatusCodes.BAD_REQUEST,'Failed to create subcategory')
      }
      await Category.updateMany(
        { _id: { $in: categoryIds } },
        { $push: { subCategories: newSubcategory[0]._id } },
        { session }
      );
      await session.commitTransaction();
      return newSubcategory[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }


};


const updateSubcategory = async (
  id: string,
  payload: Partial<ISubcategory> & { categoryIds?: string[] }
): Promise<ISubcategory | null> => {
  const { categoryIds, ...rest } = payload;
    const uniqueSlug = rest?.title?.toLowerCase().replace(/\s+/g, '-');
    rest.slug = uniqueSlug;
  const session = await Subcategory.startSession();
  session.startTransaction();

  try {
    if(categoryIds && categoryIds.length > 0){
      rest.categories = categoryIds
    }
    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      id,
      rest,
      { new: true, session }
    );

    if (!updatedSubcategory) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Subcategory not found');
    }

    if (categoryIds && categoryIds.length > 0) {
      await Category.updateMany(
        { subCategories: id },
        { $pull: { subCategories: id } },
        { session }
      );

      await Category.updateMany(
        { _id: { $in: categoryIds } },
        { $addToSet: { subCategories: id } },
        { session }
      );
    }

    await session.commitTransaction();
    return updatedSubcategory;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};


export const SubcategoryServices = { createSubcategory, updateSubcategory };
