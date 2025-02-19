// Helper function to update salePrice with company-specific prices
import { Cprice } from '../cprice/cprice.model'

export const updateSalePriceWithCompanyPrices = async (products: any[], companyId?: string) => {
  const productIds = products.map(product => product._id.toString());

  // Fetch prices for the products from Cprice collection
  const companyPrices = companyId
    ? await Cprice.find({ company: companyId, product: { $in: productIds } })
    : await Cprice.find({ product: { $in: productIds } });

  const priceMap = new Map();
  companyPrices.forEach((cp) => {
    priceMap.set(cp.product.toString(), cp.price);
  });

  // Update salePrice with company-specific price if available
  return products.map((product) => {
    const updatedPrice = priceMap.get(product._id.toString());
    return {
      ...product.toObject(),
      updatedPrice: updatedPrice !== undefined ? updatedPrice : product.salePrice, // Add updatedPrice
    };
  });
};
