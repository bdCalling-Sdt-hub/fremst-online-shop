import { JwtPayload } from 'jsonwebtoken';
import { IProduct, IProductFilters } from './product.interface';
import { Product } from './product.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { SortOrder, Types } from 'mongoose'

import { Employee } from '../employee/employee.model'
import { ICompany } from '../company/company.interface'
import { USER_ROLES } from '../../../enum/user'
import { Company } from '../company/company.model'
import { updateSalePriceWithCompanyPrices } from './product.utils'

const createProduct = async (payload: IProduct, user: JwtPayload) => {

  payload.createdBy = new Types.ObjectId(user.userId);
  const product = await Product.create([payload]);
  if(!product || product.length === 0){
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create product');
  }
  return product[0];
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

const getAllProduct = async (user: JwtPayload, filters: IProductFilters, paginationOptions: IPaginationOptions) => {
  const { searchTerm, minPrice, company, maxPrice, category, tag, brand, ...filtersData } = filters;

  const { sortBy, sortOrder } = paginationHelper.calculatePagination(paginationOptions);
  const sortCondition: { [key: string]: SortOrder } = {};
  if (sortBy && sortOrder) {
    sortCondition[sortBy] = sortOrder;
  }

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { additionalInfo: { $regex: searchTerm, $options: 'i' } },
        { sizes: { $regex: searchTerm, $options: 'i' } },
        { colors: { $regex: searchTerm, $options: 'i' } },
        { brand: { $regex: searchTerm, $options: 'i' } },
        { tags: { $regex: searchTerm, $options: 'i' } },
      ],
    });
  }

  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceCondition: { $gte?: number; $lte?: number } = {};
    if (minPrice !== undefined) priceCondition.$gte = minPrice;
    if (maxPrice !== undefined) priceCondition.$lte = maxPrice;
    andConditions.push({ salePrice: priceCondition });
  }

  if (brand !== undefined || tag !== undefined) {
    andConditions.push({
      $and: [{ brand: { $exists: true } }, { tags: { $exists: true } }],
    });
  }

  if (category !== undefined) {
    if (Array.isArray(category)) {
      andConditions.push({
        category: { $in: category },
      });
    } else {
      andConditions.push({
        category: category,
      });
    }
  }

  const whereConditions = andConditions.length > 0 ? { $and: andConditions } : {};

  // Fetch user and company details
  const [result, userDetails, companyDetails] = await Promise.all([
    Product.find(whereConditions)
      .populate({
        path: 'createdBy',
        select: {
          _id: 1,
          name: 1,
        },
      })
      .populate({
        path: 'category',
        select: {
          _id: 1,
          title: 1,
          slug: 1,
        },
      })
      .sort(sortCondition),

    user.role === USER_ROLES.EMPLOYEE
      ? Employee.findById(user.userId, { _id: 0, company: 1 }).populate<{ company: Partial<ICompany> }>({
        path: 'company',
        select: { availableProducts: 1 },
      })
      : Promise.resolve(null),

    user.role === USER_ROLES.SUPER_ADMIN || USER_ROLES.ADMIN
      ? Company.findById(company)
      : Promise.resolve(null),
  ]);



  // For employees, return only company-available products with updated prices
  if (user.role === USER_ROLES.EMPLOYEE) {
    if (!userDetails || !userDetails.company) {
      return [];
    }
    return userDetails?.company?._id
      ? await updateSalePriceWithCompanyPrices(result, userDetails.company._id.toString(), USER_ROLES.EMPLOYEE)
      : [];
  }

  // For other roles, filter by company if provided and update all product prices
  if (company) {
    if (!companyDetails) {
      return [];
    }
    return await updateSalePriceWithCompanyPrices(result, company);
  }

  // If no company filter is provided, return all products with updated prices
  return await updateSalePriceWithCompanyPrices(result);
};


const getSingleProduct = async (id: Types.ObjectId, user: JwtPayload) => {
  // Fetch both the product and the employee details concurrently
  const [product, employee] = await Promise.all([
    Product.findById(id)
      .populate({
        path: 'createdBy',
        select: {
          _id: 0,
          name: 1,
        },
      })
      .populate({
        path: 'category',
        select: {
          _id: 1,
          title: 1,
          slug: 1,
        },
      }),

    user.role === USER_ROLES.EMPLOYEE
      ? Employee.findById(user.userId, { company: 1 }).populate<{ company: Partial<ICompany> }>({
        path: 'company',
        select: 'availableProducts',
      })
      : Promise.resolve(null),
  ]);

  // If the user is an employee and company details are available
  if (user.role === USER_ROLES.EMPLOYEE && employee?.company) {
    const { company } = employee;
    // Check if the company has the product in availableProducts
    if (company.availableProducts && company.availableProducts.includes(id)) {
      // Update the price for employees based on the company
      const updatedProduct = await updateSalePriceWithCompanyPrices([product], company._id?.toString(), USER_ROLES.EMPLOYEE);
      return updatedProduct[0]; // Return the first updated product
    }
  }

  // For other roles or if the company does not have the product, return the original product
  return product;
};



export const ProductServices = { createProduct, updateProduct, deleteProduct, getAllProduct, getSingleProduct };
