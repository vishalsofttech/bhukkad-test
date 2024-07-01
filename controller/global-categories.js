const GlobalCategoryModel = require("../model/global-categories");
const RestaurantModel = require("../model/restaurants");
const { deleteImage } = require("../simple-storage-service/delete-object");
const { S3bucketUpload } = require("../simple-storage-service/s3");

async function addGlobalCategory(req, res) {
  const { categoryName } = req.body;

  if (!categoryName || !req.file) {
    return res.status(400).json({ message: "All are fields required." });
  }

  try {
    const exist = await GlobalCategoryModel.findOne({ name: categoryName });

    if (exist) {
      return res.status(400).json({ message: "This category already exist." });
    }

    const image = await S3bucketUpload(
      req.file,
      5,
      process.env.S3_ACCESS_KEY,
      process.env.S3_ACCESS_SECRET,
      process.env.S3_REGION,
      "bhukkadimages"
    );

    const newcategory = await new GlobalCategoryModel({
      name: categoryName,
      url: image.img,
      key: image.Key,
    }).save();

    res.json({ data: newcategory });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Failed to save global category." });
  }
}

async function getGlobalCategories(req, res) {
  try {
    const catgeories = await GlobalCategoryModel.find();
    res.json({ data: catgeories });
  } catch (err) {
    res.json({ message: "Failed to get global categories." });
  }
}

async function deleteGlobalCategory(req, res) {
  const { categoryID } = req.body;

  if (!categoryID?.trim()) {
    return res.status(400).json({ message: "Category id is required." });
  }

  try {
    const category = await GlobalCategoryModel.findById(categoryID);

    if (!category) {
      return res.status(400).json({ message: "Category not found." });
    }

    const restaurantThatUsingTheCategory = await RestaurantModel.findOne({
      globalCategories: categoryID,
    });

    if (restaurantThatUsingTheCategory) {
      return res
        .status(400)
        .json({ message: "This category currently in used." });
    }

    await deleteImage("bhukkadimages", category.key);
    const data = await GlobalCategoryModel.findByIdAndDelete(categoryID);

    res.json({ message: "Category deleted successfully", data });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete category." });
  }
}

module.exports = {
  addGlobalCategory,
  getGlobalCategories,
  deleteGlobalCategory,
};
