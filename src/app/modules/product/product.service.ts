import { JwtPayload } from 'jsonwebtoken';
import { IProduct, IProductFilters, ProductModel } from './product.interface';
import { Product } from './product.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import mongoose, { SortOrder, Types } from 'mongoose';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { productSearchableFields } from './product.constants';
import { Tags } from '../tags/tags.model';

const createProduct = async (payload: IProduct, user: JwtPayload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    payload.createdBy = user.authId;

    // Create the product
    const product = await Product.create([payload], { session });
    if (!product || product.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create product');
    }

    const createdProduct = product[0];

    // Add product to the tags
    if (payload.tags && payload.tags.length > 0) {
      const bulkWriteOps = payload.tags.map((tag) => ({
        updateOne: {
          filter: { _id: tag },
          update: { $push: { products: createdProduct._id } },
          upsert: true,
        },
      }));

      const bulkWriteResult = await Tags.bulkWrite(bulkWriteOps, { session });
      if (!bulkWriteResult || bulkWriteResult.modifiedCount === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update tags');
      }
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return createdProduct;
  } catch (error) {
    // Abort the transaction in case of error
    await session.abortTransaction();
    session.endSession();
    // Re-throw the error
    throw error;
  }
};

const updateProduct = async (id: Types.ObjectId, payload: IProduct & {existingFeaturedImages: string[]}) => {  

    if(payload.existingFeaturedImages && payload.existingFeaturedImages.length > 0 ){
      if(payload.featuredImages && payload.featuredImages.length > 0){
        payload.featuredImages = [...payload.existingFeaturedImages, ...payload.featuredImages]
      }
      else{
        payload.featuredImages = payload.existingFeaturedImages
      }
    }

    const product = await Product.findByIdAndUpdate(id, {$set: payload }, { new: true });
    if(!product){
        throw new ApiError(StatusCodes.BAD_REQUEST,'Failed to update product')
    }
    return product
}

const deleteProduct = async (id: Types.ObjectId) => {  
    const product = await Product.findByIdAndDelete(id);
    if(!product){
        throw new ApiError(StatusCodes.BAD_REQUEST,'Failed to delete product')
    }
    return product
}

const getAllProduct = async (filters:IProductFilters, paginationOptions:IPaginationOptions) => {
    const { searchTerm, minPrice, maxPrice,category, tag, brand, ...filtersData } = filters;

    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(paginationOptions);
    const sortCondition: { [key: string]: SortOrder } = {};
    if (sortBy && sortOrder) {
      sortCondition[sortBy] = sortOrder;
    }


    const andConditions = [];

    if (searchTerm) {

         // Partial search for fields that are arrays (sizes, colors, brands, tags)
         andConditions.push({
            $or: [
              { name: { $regex: searchTerm, $options: 'i' } },
              { description: { $regex: searchTerm, $options: 'i' } },
              { additionalInfo: { $regex: searchTerm, $options: 'i' } },
              { sizes: { $regex: searchTerm, $options: 'i' } },
              { colors: { $regex: searchTerm, $options: 'i' } },
              { brand: { $regex: searchTerm, $options: 'i' } },
              { tags: { $regex: searchTerm, $options: 'i' } }
            ]
          });
          
    }

    if (Object.keys(filtersData).length) {
        andConditions.push({
            $and: Object.entries(filtersData).map(([field, value]) => ({
                [field]: value
            }))
        });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        const priceCondition: { $gte?: number; $lte?: number } = {};
        if (minPrice !== undefined) priceCondition.$gte = minPrice;
        if (maxPrice !== undefined) priceCondition.$lte = maxPrice;
        andConditions.push({ salePrice: priceCondition });
    }

    if(brand !== undefined || tag !==undefined){

      andConditions.push({
        $and: [
          { brand: { $exists: true } },
          { tags: { $exists: true } }
        ]
      });
    }

   // Multiple category filtering
  if (category !== undefined) {
    // If category is an array (from query params like ?category=cat1&category=cat2)
    if (Array.isArray(category)) {
      andConditions.push({
        category: { $in: category }, // Use $in operator to match any of the provided category IDs
      });
    } else {
      // If category is a single value
      andConditions.push({
        category: category,
      });
    }
  }




    const whereConditions = andConditions.length > 0 ? {$and: andConditions} : {};
    const result = await Product.find(whereConditions)
    .populate({
        path: 'createdBy',
        select: {
            _id: 1,
            name: 1,
        },
    }).populate({
        path: 'category',
        select: {
            _id: 1,
            title: 1,
            slug: 1,
        },
    }).sort(sortCondition);



    // const total = await Product.countDocuments(whereConditions);
    return result
};

const getSingleProduct = async (id: Types.ObjectId) => {
  const result = await Product.findById(id).populate({
    path: 'createdBy',
    select: {
      _id: 0,
      name: 1,
    },
  }).populate({
    path: 'category',
    select: {
      _id: 1,
      title: 1,
      slug: 1,
    },
  })
  // .populate({
  //   path: 'subcategory',
  //   select: {
  //     _id: 0,
  //     title: 1,
  //     slug: 1,
  //   },
  // });
  return result;
};



export const ProductServices = { createProduct, updateProduct, deleteProduct, getAllProduct, getSingleProduct };
