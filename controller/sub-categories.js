const SubCategoryModel = require("../model/sub-categories");
const MenuModel = require("../model/menu");

async function createSubCategory(req, res) {
  const { categoryID, subCategory } = req.body;

  if (!categoryID?.trim() || !subCategory?.trim()) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const savedSubCategory = await new SubCategoryModel({
      name: subCategory,
      category: categoryID,
    }).save();
    res.json({
      message: "Sub category created successfully.",
      id: savedSubCategory._id,
    });
  } catch (err) {
    res.status(400).json({ message: "Sub category creation failed." });
  }
}

async function deleteSubCategory(req, res) {
  const { subCategoryID } = req.body;

  if (!subCategoryID?.trim()) {
    return res.status(400).json({ message: "Sub category id is required." });
  }

  try {
    const menu = await MenuModel.findOne({ subCategory: subCategoryID });

    if (menu) {
      return res
        .status(400)
        .json({ message: "This sub category has been used." });
    }

    await SubCategoryModel.findByIdAndDelete(subCategoryID);
    res.json({ message: "Sub category deleted successfully." });
  } catch (err) {
    res.status(400).json({ message: "Sub category deletion failed." });
  }
}

async function getSubCategories(req, res) {
  const { categoryID } = req.body;

  if (!categoryID?.trim()) {
    return res.status(400).json({ message: "Category id is required." });
  }

  try {
    const subCategories = await SubCategoryModel.find({ category: categoryID });
    res.json({ data: subCategories });
  } catch (Err) {
    res.status(400).json({ message: "Failed to get categories" });
  }
}

module.exports = {
  createSubCategory,
  deleteSubCategory,
  getSubCategories,
};
