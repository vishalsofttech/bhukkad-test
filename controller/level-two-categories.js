const LevelTwoCategoriesModel = require("../model/level-two-categories");
const RestaurantModel = require("../model/restaurants");

async function addLevelTwoCategory(req, res) {
  const { categoryName } = req.body;

  if (!categoryName?.trim()) {
    return res.status(400).json({ message: "Category name is required." });
  }

  try {
    const alreadyExistCategory = await LevelTwoCategoriesModel.findOne({
      name: categoryName,
    });

    if (alreadyExistCategory) {
      return res.status(400).json({ message: "This category already exist." });
    }

    const category = await new LevelTwoCategoriesModel({
      name: categoryName,
    }).save();

    res.json({ message: "Category saved successfully.", data: category });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Failed to save category." });
  }
}

async function getLevelTwoCategories(req, res) {
  try {
    const categories = await LevelTwoCategoriesModel.find();
    res.json({ message: "Fetch categories successfully.", data: categories });
  } catch (Err) {
    res.status(400).json({ message: "Failed to get categories." });
  }
}

async function deleteLevelTwoCategory(req, res) {
  const { categoryID } = req.body;

  if (!categoryID?.trim()) {
    return res.status(400).json({ message: "CategoryID is requried" });
  }

  try {
    const category = await LevelTwoCategoriesModel.findById(categoryID);

    if (!category) {
      return res.status(400).json({ message: "Category not found" });
    }

    const restaurantsThatUsingCategory = await RestaurantModel.findOne({
      levelTwoCategories: categoryID,
    });

    if (restaurantsThatUsingCategory) {
      return res.status(400).json({ message: "That Category has been used." });
    }

    await LevelTwoCategoriesModel.findByIdAndDelete(categoryID);

    res.json({ message: "Category deleted successfully." });
  } catch (Err) {
    res.status(400).json({ message: "Failed delete category." });
  }
}

module.exports = {
  addLevelTwoCategory,
  deleteLevelTwoCategory,
  getLevelTwoCategories,
};
