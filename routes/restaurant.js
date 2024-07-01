const express = require("express");
const {
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
} = require("../controller/restaurant");
const { upload } = require("../multer");
const app = express.Router();

app.get("/", (req, res) => {
  res.json({ message: "bhukkads is started." });
});

app.post(
  "/restaurant",
  upload.fields([
    { name: "fssaiImages", maxCount: 5 },
    { name: "gstImages", maxCount: 5 },
    { name: "heroImage", maxCount: 1 },
  ]),
  createRestaurant
);

app.post(
  "/update-restaurant",
  upload.fields([
    { name: "fssaiImages", maxCount: 5 },
    { name: "gstImages", maxCount: 5 },
    { name: "heroImage", maxCount: 1 },
  ]),
  updateRestaurant
);

app.post("/get-restaurant-by-owner", getRestaurantsByOwner);
app.post("/active-deactive-restaurant", activeAndDeactiveRestaurant);
app.post("/get-single-restaurant", getSingleRestaurant);
app.post(
  "/upload-restaurant-images",
  upload.array("images"),
  uploadRestaurantImages
);
app.post("/get-restaurant-images", getRestaurantImages);
app.post("/delete-restaurant-image", deleteRestaurantImage);
app.post("/add-or-update-global-categories", addOrUpdateGlobalCategory);
app.post(
  "/get-global-categories-of-restaurant",
  getGlobalCategoriesOfRestaurant
);
app.post("/add-table-and-Chairs-of-Restaurant", addTableAndChairsOfRestaurant);
app.post("/get-Table-And-Chairs-Of-Restaurant", getTableAndChairsOfRestaurant);
app.post("/delete-tables", deleteTables);
app.post(
  "/add-level-two-category-of-restaurant",
  addLevelTwoCategoryOfRestaurant
);
app.post("/get-restaurants-by-name", getRestaurantsByName);

module.exports = app;
