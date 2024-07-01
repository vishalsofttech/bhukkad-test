const MenuModel = require("../model/menu");
const { S3bucketUpload } = require("../simple-storage-service/s3");
const { deleteImage } = require("../simple-storage-service/delete-object");
const DishImagesModel = require("../model/dish-images");
const { Types } = require("mongoose");

async function addDish(req, res) {
  const { dishName, price, restaurantId, categoryId, subCategoryId } = req.body;

  if (!dishName || !price || !restaurantId?.trim() || !categoryId?.trim()) {
    return res.status(400).json({ message: "All fields required." });
  }

  try {
    const dish = await new MenuModel({
      dishName,
      price,
      category: categoryId,
      restaurant: restaurantId,
      subCategory: subCategoryId,
    }).save();

    res.json({ message: "Dish saved sccessfully.", id: dish._id });
  } catch (err) {
    res.status(400).json({ message: "Failed to saved." });
  }
}

async function updateDish(req, res) {
  const { dishName, price, categoryId, subCategoryId, dishId } = req.body;

  if (!dishId?.trim()) {
    return res.status(400).json({ message: "DishId is required." });
  }

  try {
    await MenuModel.findByIdAndUpdate(dishId, {
      dishName,
      price,
      category: categoryId,
      subCategory: subCategoryId,
    });

    res.json({ message: "Dish updated sccessfully." });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Failed to update." });
  }
}

async function addDishImages(req, res) {
  const { dishId } = req.body;

  if (!req.files.length || !dishId?.trim()) {
    return res.status(400).json({ message: "All fields required." });
  }

  try {
    const dish = await MenuModel.findById(dishId);
    if (!dish) {
      return res.status(400).json({ message: "Dish not found." });
    }

    const imagePromises = [];

    req.files.forEach((el) => {
      const promise = S3bucketUpload(
        el,
        5,
        process.env.S3_ACCESS_KEY,
        process.env.S3_ACCESS_SECRET,
        process.env.S3_REGION,
        "bhukkadimages"
      );
      imagePromises.push(promise);
    });

    Promise.all(imagePromises)
      .then(async (promiseResults) => {
        const savesResult = promiseResults.map((el) => ({
          key: el.Key,
          url: el.img,
          dish: dishId,
        }));
        await DishImagesModel.insertMany(savesResult);
        res.json({ message: "Dish images saved successfully." });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({ message: "Dish images failed to save." });
      });
  } catch (Err) {
    console.log(Err);
    res.status(400).json({ message: "Dish images failed to save." });
  }
}

async function getDishImages(req, res) {
  const { dishId } = req.body;

  if (!dishId?.trim()) {
    return res.status(400).json({ message: "DishId is required." });
  }

  try {
    const images = await DishImagesModel.find({ dish: dishId });
    res.json({ images });
  } catch (Err) {
    res.status(400).json({ message: "Failed to get dish images." });
  }
}

async function deleteDishImage(req, res) {
  const { imageId } = req.body;

  if (!imageId?.trim()) {
    return res.status(400).json({ message: "Image id is required." });
  }

  try {
    const image = await DishImagesModel.findById(imageId);
    if (!image) {
      return res.status(404).json({ message: "Dish image not found." });
    }

    await deleteImage("bhukkadimages", image.key);
    await DishImagesModel.findByIdAndDelete(imageId);
    res.json({ message: "Image deleted successfully." });
  } catch (err) {
    res.status(400).json({ message: "Image deletion failed." });
  }
}

async function deleteDish(req, res) {
  const { dishId } = req.body;

  if (!dishId?.trim()) {
    return res.status(400).json({ message: "Dish id  is required." });
  }

  try {
    const dish = await MenuModel.findById(dishId);

    if (!dish) {
      return res.status(400).json({ message: "Dish not found." });
    }

    const dishImages = await DishImagesModel.find({ dish: dishId });

    if (dishImages.length > 0) {
      const imagesPromises = [];

      dishImages.forEach((el) => {
        const promise = deleteImage("bhukkadimages", el.key);
        imagesPromises.push(promise);
      });

      await Promise.allSettled(imagesPromises);
      await DishImagesModel.deleteMany({ dish: dishId });
    }

    await MenuModel.findByIdAndDelete(dishId);
    res.json({ message: "Dish deleted successfully." });
  } catch (err) {
    res.status(400).json({ message: "Dish deletion failed." });
  }
}

async function getMenuByRestaurant(req, res) {
  const { restaurantID } = req.body;

  if (!restaurantID?.trim()) {
    return res.status(400).json({ message: "Restaurant id is required." });
  }

  try {
    const menus = await MenuModel.aggregate([
      {
        $match: {
          restaurant: Types.ObjectId.createFromHexString(restaurantID),
        },
      },
      {
        $lookup: {
          from: "restaurants_categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },

      {
        $lookup: {
          from: "sub_categories",
          localField: "subCategory",
          foreignField: "_id",
          as: "subCategory",
        },
      },
      {
        $unwind: "$subCategory",
      },

      {
        $project: {
          dishName: 1,
          price: 1,
          category: "$category.name",
          subCategory: "$subCategory.name",
        },
      },
    ]);
    // const menus = await MenuModel.find({ restaurant: restaurantID }).populate("category");

    res.json({ data: menus });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Failed to get menus." });
  }
}

module.exports = {
  addDish,
  updateDish,
  deleteDish,
  addDishImages,
  getDishImages,
  deleteDishImage,
  getMenuByRestaurant,
};
