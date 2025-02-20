 // Assuming Company is imported from your model file

import { Cprice } from '../cprice/cprice.model'
 import { Company } from '../company/company.model'
 import { USER_ROLES } from '../../../enum/user'


 export const updateSalePriceWithCompanyPrices = async (products: any[], companyId?: string, role?: string) => {
   const productIds = products.map(product => product._id.toString());

   // Fetch prices for the products from Cprice collection
   const companyPrices = companyId
     ? await Cprice.find({ company: companyId, product: { $in: productIds } })
     : await Cprice.find({ product: { $in: productIds } });

   const priceMap = new Map();
   companyPrices.forEach((cp) => {
     priceMap.set(cp.product.toString(), cp.price);
   });

   // If the user role is 'employee', filter the products based on company availability
   if ((role === USER_ROLES.EMPLOYEE && companyId) || (role === USER_ROLES.COMPANY && companyId)) {
     // Fetch the company document to get available products
     const company = await Company.findById(companyId).select('availableProducts');

     // If the company exists, filter the products based on availability
     if (company && company.availableProducts) {
       products = products.filter((product) =>
         company.availableProducts.includes(product._id)
       );
     } else {
       // If no available products are found, return an empty array or handle it as needed
       products = [];
     }

     // Replace salePrice with updatedPrice for employees
     return products.map((product) => {
       const updatedPrice = priceMap.get(product._id.toString());
       return {
         ...product.toObject(),
         salePrice: updatedPrice !== undefined ? updatedPrice : product.salePrice, // Replace salePrice
       };
     });
   }

   // For non-employee roles, return products with updatedPrice
   return products.map((product) => {
     const updatedPrice = priceMap.get(product._id.toString());
     return {
       ...product.toObject(),
       updatedPrice: updatedPrice !== undefined ? updatedPrice : product.salePrice, // Add updatedPrice
     };
   });
 };
