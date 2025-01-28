import { CategoryModel, ICategory } from './category.interface';
import { Category } from './category.model';
const createCategory = async (data: ICategory) => {
    //create unique slug
    const uniqueSlug = data.title.toLowerCase().replace(/\s+/g, '-');
    data.slug = uniqueSlug;
    const result = await Category.create(data);
    return result;
  };

  const updateCategory = async (id: string, data: any) => {
    //create unique slug
    const uniqueSlug = data.title.toLowerCase().replace(/\s+/g, '-');
    data.slug = uniqueSlug;
    const result = await Category.findOneAndUpdate({ _id: id }, data, {
      new: true,
    });
    return result;
  };
  const getAllCategory = async () => {
    const result = await Category.find({}).select({
      _id: 1,
      title: 1,
      slug: 1,
      image: 1,
      // subCategories: 1,
    })
    // .populate({
    //   // path: 'subCategories',
    //   // select: {
    //   //   _id: 1,
    //   //   title: 1,
    //   //   slug: 1,
    //   // },
    // });
    return result;
  };


export const CategoryServices = { createCategory, updateCategory, getAllCategory };
