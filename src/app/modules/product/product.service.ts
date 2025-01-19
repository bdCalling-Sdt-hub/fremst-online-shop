import { JwtPayload } from 'jsonwebtoken';
import { IProduct, IProductFilters, ProductModel } from './product.interface';
import { Product } from './product.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { SortOrder, Types } from 'mongoose';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { productSearchableFields } from './product.constants';

const createProduct = async (payload: IProduct, user: JwtPayload) => {

    payload.createdBy = user.authId;

    const product = await Product.create(payload);
    if(!product){
        throw new ApiError(StatusCodes.BAD_REQUEST,'Failed to create product')
    }
    return product
}

const updateProduct = async (id: Types.ObjectId, payload: IProduct) => {  
    const product = await Product.findByIdAndUpdate(id, {$set: payload}, { new: true });
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
    const { searchTerm, minPrice, maxPrice,category,subcategory, ...filtersData } = filters;

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
          console.log(andConditions)
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
    }).populate({
        path: 'subcategory',
        select: {
            _id: 1,
            title: 1,
            slug: 1,
        },
    }).sort(sortCondition).skip(skip).limit(limit);



    const total = await Product.countDocuments(whereConditions);
    return {
        meta: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit),
        },
        data: result
    }   
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
      _id: 0,
      title: 1,
      slug: 1,
    },
  }).populate({
    path: 'subcategory',
    select: {
      _id: 0,
      title: 1,
      slug: 1,
    },
  });
  return result;
};

export const ProductServices = { createProduct, updateProduct, deleteProduct, getAllProduct, getSingleProduct };
