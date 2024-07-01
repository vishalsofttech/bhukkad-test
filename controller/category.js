const CategoryModel = require("../model/restaurants-categories");
const SubCategoryModel = require("../model/sub-categories");
const MenuModel = require("../model/menu");

async function createCatgory(req, res) {
  const { category, restaurantID } = req.body;

  if (!category?.trim() || !restaurantID?.trim()) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
   const savedCategory = await new CategoryModel({
      name: category,
      restaurant: restaurantID,
    }).save();
    res.json({ message: "Category created successfully.",id:savedCategory._id });
  } catch (err) {
    res.status(400).json({ message: "Failed to save category." });
  }
}

async function deleteCategory(req, res) {
  const { categoryID } = req.body;

  if (!categoryID?.trim()) {
    return res.status(400).json({ message: "Category id is required." });
  }

  try {
    const category = await CategoryModel.findById(categoryID);

    if (!category) {
      return res.status(400).json({ message: "Category not found." });
    }

    const menu = await MenuModel.findOne({ category: categoryID });

    if (menu) {
      return res.status(400).json({ message: "This category has been used." });
    }

    //delete subcategories of a category
    await SubCategoryModel.deleteMany({ category: categoryID });

    //delete actual category
    await CategoryModel.findByIdAndDelete(categoryID);
    res.json({ message: "Category Deleted successfully." });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete category." });
  }
}

async function getCategories(req, res) {
  const { restaurantID } = req.body;

  if (!restaurantID?.trim()) {
    return res.status(400).json({ message: "Restaurant id is required." });
  }

  try {
    const categories = await CategoryModel.find({ restaurant: restaurantID });
    res.json({ categories });
  } catch (err) {
    res.status(400).json({ message: "Failed to get categories." });
  }
}

module.exports = { createCatgory, deleteCategory, getCategories };
