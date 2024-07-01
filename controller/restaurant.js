const RestaurantModel = require("../model/restaurants");
const OwnerModel = require("../model/owners");
const { S3bucketUpload } = require("../simple-storage-service/s3");
const { deleteImage } = require("../simple-storage-service/delete-object");
const RestaurantImagesModel = require("../model/restaurant-images");
const TableAndChairsModel = require("../model/table-and-chairs");
const { Types } = require("mongoose");

async function createRestaurant(req, res) {
  const {
    name,
    gst,
    fssai,
    latitude,
    longitude,
    address,
    contact,
    tablesQuantity,
    openingTime,
    closingTime,
    owner,
  } = req.body;

  if (
    !name ||
    !gst ||
    !fssai ||
    !latitude ||
    !longitude ||
    !address ||
    !contact ||
    !tablesQuantity ||
    !owner ||
    !req.files?.fssaiImages ||
    !req.files?.gstImages ||
    !req.files?.heroImage ||
    !openingTime ||
    !closingTime
  ) {
    return res.status(400).json({ message: "All fields requried." });
  }

  try {
    const existOwner = await OwnerModel.findById(owner);

    if (!existOwner) {
      return res.status(400).json({ message: "Owner not found." });
    }

    const fssaiImgPromises = [];
    const gstImgPromises = [];

    req.files.fssaiImages.forEach(async (el) => {
      const promise = S3bucketUpload(
        el,
        5,
        process.env.S3_ACCESS_KEY,
        process.env.S3_ACCESS_SECRET,
        process.env.S3_REGION,
        "bhukkadimages"
      );

      fssaiImgPromises.push(promise);
    });

    req.files.gstImages.forEach(async (el) => {
      const promise = S3bucketUpload(
        el,
        5,
        process.env.S3_ACCESS_KEY,
        process.env.S3_ACCESS_SECRET,
        process.env.S3_REGION,
        "bhukkadimages"
      );

      gstImgPromises.push(promise);
    });

    const heroImage = await S3bucketUpload(
      req.files.heroImage[0],
      5,
      process.env.S3_ACCESS_KEY,
      process.env.S3_ACCESS_SECRET,
      process.env.S3_REGION,
      "bhukkadimages"
    );

    const fssaiImgResult = await Promise.allSettled(fssaiImgPromises);
    const gstImgResult = await Promise.allSettled(gstImgPromises);

    const location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    const newRestaurant = await new RestaurantModel({
      name,
      gst,
      fssai,
      location,
      address,
      contact,
      tablesQuantity,
      owner,
      fssaiImages: fssaiImgResult.map((el) => ({
        key: el.value.Key,
        url: el.value.img,
      })),
      gstImages: gstImgResult.map((el) => ({
        key: el.value.Key,
        url: el.value.img,
      })),
      openingTime,
      closingTime,
      heroImage: {
        key: heroImage.Key,
        url: heroImage.img,
      },
    }).save();

    res.json({ message: "Create restaurant successfully.", id: newRestaurant._id });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Failed to create restaurant." });
  }
}

async function getRestaurantsByOwner(req, res) {
  const { ownerID } = req.body;

  if (!ownerID?.trim()) {
    return res.status(400).json({ message: "OwnerID is required" });
  }

  const restaurants = await RestaurantModel.aggregate([
    {
      $match: { owner: Types.ObjectId.createFromHexString(ownerID) },
    },
    {
      $lookup: {
        from: "restaurant-images",
        localField: "_id",
        foreignField: "restaurant",
        as: "images",
      },
    },
  ]);

  return res.json({ restaurants });
}

async function activeAndDeactiveRestaurant(req, res) {
  const { restaurantID, status } = req.body;

  if (!restaurantID?.trim() || typeof status !== "boolean") {
    return res.status(400).json({ message: "All fields required" });
  }

  const restaurant = await RestaurantModel.findById(restaurantID);

  if (!restaurant) {
    return res.status(400).json({ message: "Restaurant not found." });
  }

  try {
    const ownerOfRestaurant = await OwnerModel.findOne({
      _id: restaurant.owner,
    });

    if (!ownerOfRestaurant.active) {
      return res
        .status(400)
        .json({ message: "This restaurant owner is deactivated." });
    }

    await RestaurantModel.findByIdAndUpdate(restaurantID, { active: status });
    res.json({
      message: `Restaurant ${
        status ? "activation" : "deactivation"
      } successfully.`,
    });
  } catch (err) {
    res.status(400).json({ message: "Restaurant deactivation failed." });
  }
}

async function getSingleRestaurant(req, res) {
  const { restaurantID } = req.body;

  if (!restaurantID?.trim()) {
    return res.status(400).json({ message: "RestaurantID is required." });
  }

  try {
    const restaurant = await RestaurantModel.aggregate([
      { $match: { _id: Types.ObjectId.createFromHexString(restaurantID) } },
      {
        $lookup: {
          from: "restaurant-images",
          localField: "_id",
          foreignField: "restaurant",
          as: "images",
        },
      },
      {
        $lookup: {
          from: "owners",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: "$owner" },
    ]);

    res.json({ restaurant: restaurant.length > 0 ? restaurant[0] : {} });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Failed to get Restaurant." });
  }
}

async function uploadRestaurantImages(req, res) {
  const { restaurantID } = req.body;

  if (!restaurantID?.trim()) {
    return res.status(400).json({ message: "RestaurantID is required." });
  }

  const imagesPromises = [];

  try {
    req.files.forEach(async (el) => {
      const promise = S3bucketUpload(
        el,
        5,
        process.env.S3_ACCESS_KEY,
        process.env.S3_ACCESS_SECRET,
        process.env.S3_REGION,
        "bhukkadimages"
      );

      imagesPromises.push(promise);
    });

    const result = await Promise.allSettled(imagesPromises);

    const allImages = result.map((el) => ({
      key: el.value.Key,
      url: el.value.img,
      restaurant: restaurantID,
    }));

    await RestaurantImagesModel.insertMany(allImages);
    res.json({ message: "Inserted successfully." });
  } catch (err) {
    console.log(err);
    res.json({ message: "Insertion Failed." });
  }
}

async function getRestaurantImages(req, res) {
  const { restaurantID } = req.body;

  if (!restaurantID?.trim()) {
    return res.status(400).json({ message: "RestaurantID is required." });
  }

  const images = await RestaurantImagesModel.find({ restaurant: restaurantID });
  res.json({ images });
}

async function deleteRestaurantImage(req, res) {
  const { imageID } = req.body;

  if (!imageID?.trim()) {
    return res.status(400).json({ message: "ImageID is required." });
  }

  try {
    const image = await RestaurantImagesModel.findById(imageID);

    if (!image) {
      return res.status(400).json({ message: "Image not found." });
    }

    await deleteImage("bhukkadimages", image.key);

    await RestaurantImagesModel.findByIdAndDelete(imageID);
    res.json({ message: "Delete successfully." });
  } catch (err) {
    res.json({ message: "Deletion failed." });
  }
}

async function updateRestaurant(req, res) {
  const {
    name,
    gst,
    fssai,
    latitude,
    longitude,
    address,
    contact,
    tablesQuantity,
    restaurantId,
    openingTime,
    closingTime,
  } = req.body;

  if (!restaurantId?.trim()) {
    return res.status(400).json({ message: "RestaurantID is required." });
  }

  try {
    const restaurant = await RestaurantModel.findById(restaurantId);
    if (!restaurant) {
      return res.status(400).json({ message: "Restaurant not found." });
    }

    let fssaiImages;
    let gstImages;
    let fssaiImagesPromises = [];
    let gstImagesPromises = [];
    let heroImage;
    let location;

    if (req.files.fssaiImages && req.files.fssaiImages.length > 0) {
      //delete fssai existing images
      let deleteFssaiImgPromises = [];

      restaurant.fssaiImages.forEach((el) => {
        const promise = deleteImage("bhukkadimages", el.key);
        deleteFssaiImgPromises.push(promise);
      });

      await Promise.allSettled(deleteFssaiImgPromises);

      // upload new fssai images
      req.files.fssaiImages.forEach(async (el) => {
        const promise = S3bucketUpload(
          el,
          5,
          process.env.S3_ACCESS_KEY,
          process.env.S3_ACCESS_SECRET,
          process.env.S3_REGION,
          "bhukkadimages"
        );
        fssaiImagesPromises.push(promise);
      });

      const uploadedImages = await Promise.allSettled(fssaiImagesPromises);
      fssaiImages = uploadedImages.map((el) => ({
        key: el.value.Key,
        url: el.value.img,
      }));
    }

    if (req.files.gstImages && req.files.gstImages.length > 0) {
      //delete fssai existing images
      let deleteGSTImgPromises = [];

      restaurant.gstImages.forEach((el) => {
        const promise = deleteImage("bhukkadimages", el.key);
        deleteGSTImgPromises.push(promise);
      });

      await Promise.allSettled(deleteGSTImgPromises);

      // upload new fssai images
      req.files.gstImages.forEach(async (el) => {
        const promise = S3bucketUpload(
          el,
          5,
          process.env.S3_ACCESS_KEY,
          process.env.S3_ACCESS_SECRET,
          process.env.S3_REGION,
          "bhukkadimages"
        );
        gstImagesPromises.push(promise);
      });

      const uploadedImages = await Promise.allSettled(gstImagesPromises);
      gstImages = uploadedImages.map((el) => ({
        key: el.value.Key,
        url: el.value.img,
      }));
    }

    if (req.files.heroImage && req.files.heroImage.length > 0) {
      await deleteImage("bhukkadimages", restaurant.heroImage.key);
      const newHeroImage = await S3bucketUpload(
        req.files.heroImage[0],
        5,
        process.env.S3_ACCESS_KEY,
        process.env.S3_ACCESS_SECRET,
        process.env.S3_REGION,
        "bhukkadimages"
      );
      heroImage = { key: newHeroImage.Key, url: newHeroImage.img };
    }

    if (longitude && latitude) {
      location = {
        type: "Point",
        coordinates: [longitude, latitude],
      };
    }

    const updatedRestaurant = await RestaurantModel.findByIdAndUpdate(
      restaurantId,
      {
        name,
        gst,
        fssai,
        location,
        address,
        contact,
        tablesQuantity,
        fssaiImages,
        gstImages,
        openingTime,
        closingTime,
        heroImage,
      },
      { new: true }
    );

    res.json({ message: "Restaurant update successfully.", updatedRestaurant });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Failed to update restaurant." });
  }
}

async function addOrUpdateGlobalCategory(req, res) {
  const { categoryIDs, restaurantID } = req.body;

  if (!categoryIDs || !restaurantID?.trim()) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const restaurant = await RestaurantModel.findById(restaurantID);

    if (!restaurant) {
      return res.status(400).json({ message: "Resaturant not found." });
    }

    const updatedRestaurant = await RestaurantModel.findByIdAndUpdate(
      restaurantID,
      { globalCategories: categoryIDs },
      { new: true }
    );

    res.json({
      message: "Update restaurant global category successfully.",
      data: updatedRestaurant.globalCategories,
    });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed update restaurant global category." });
  }
}

async function getGlobalCategoriesOfRestaurant(req, res) {
  const { restaurantID } = req.body;

  if (!restaurantID?.trim()) {
    return res.status(400).json({ message: "RestaurantID is required." });
  }

  try {
    const restaurant = await RestaurantModel.findById(restaurantID);

    if (!restaurant) {
      return res.status(400).json({ message: "Restaurant not found." });
    }

    res.json({
      message: "Get global categories successfully.",
      data: restaurant.globalCategories,
    });
  } catch (err) {
    res.status(400).json({ message: "Failed to get global categories." });
  }
}

async function addTableAndChairsOfRestaurant(req, res) {
  const { tableNo, chairs, restaurantID } = req.body;

  if (!tableNo || !chairs || !restaurantID?.trim()) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const restaurant = await RestaurantModel.findById(restaurantID);

    if (!restaurant) {
      return res.status(400).json({ message: "Restaurant not found." });
    }

    const alreadyExistTableNo = await TableAndChairsModel.findOne({
      tableNo,
      restaurant: restaurantID,
    });

    if (alreadyExistTableNo) {
      return res.status(400).json({ message: "This table no already exist." });
    }

    const tableAndChair = await new TableAndChairsModel({
      tableNo,
      chairs,
      restaurant: restaurantID,
    }).save();

    res.json({
      message: "Table and chairs created successfully.",
      data: tableAndChair,
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to saved table and chairs." });
  }
}

async function getTableAndChairsOfRestaurant(req, res) {
  const { restaurantID } = req.body;

  if (!restaurantID?.trim()) {
    return res.status(400).json({ message: "Restaurant ID is required." });
  }

  try {
    const tablesData = await TableAndChairsModel.find({
      restaurant: restaurantID,
    });

    return res.json({
      message: "Fetched categories successfully.",
      data: tablesData,
    });
  } catch (error) {
    return res.json.status(400)({
      message: "Failed to fetch categories.",
    });
  }
}

async function deleteTables(req, res) {
  const { tableId } = req.body;

  if (!tableId?.trim()) {
    return res.status(400).json("Table id is required.");
  }
  try {
    const data = await TableAndChairsModel.findByIdAndDelete(tableId);
    return res.json({ message: "Category delete successfully.", data });
  } catch (error) {
    return res.status(400).json({ message: "Failed to delete category." });
  }
}

async function addLevelTwoCategoryOfRestaurant(req, res) {
  const { categoryIDs, restaurantID } = req.body;

  if (!restaurantID?.trim()) {
    return res.status(400).json({ message: "Restaurant id is required." });
  }

  try {
    const restaurant = await RestaurantModel.findById(restaurantID);

    if (!restaurant) {
      return res.status(400).json({ message: "Restaurant not found." });
    }

    const newRestaurant = await RestaurantModel.findByIdAndUpdate(
      restaurantID,
      {
        levelTwoCategories: categoryIDs,
      },
      { new: true }
    );

    res.json({
      message: "Category saved successfully.",
      data: newRestaurant.levelTwoCategories,
    });
  } catch (Err) {
    res.status(400).json({ message: "Failed to add category." });
  }
}

async function getRestaurantsByName(req, res) {
  const { search } = req.body;

  if (!search?.trim()) {
    return res.status(400).json({ message: "Search value is required." });
  }

  const regex = new RegExp(search, "i");

  try {
    const restaturants = await RestaurantModel.find({
      name: { $regex: regex },
    });
    res.json({ data: restaturants });
  } catch (err) {
    res.status(400).json({ message: "Failed to get restaurants." });
  }
}

module.exports = {
  createRestaurant,
  getRestaurantsByOwner,
  activeAndDeactiveRestaurant,
  getSingleRestaurant,
  uploadRestaurantImages,
  getRestaurantImages,
  deleteRestaurantImage,
  updateRestaurant,
  addOrUpdateGlobalCategory,
  getGlobalCategoriesOfRestaurant,
  addTableAndChairsOfRestaurant,
  getTableAndChairsOfRestaurant,
  deleteTables,
  addLevelTwoCategoryOfRestaurant,
  getRestaurantsByName,
};
