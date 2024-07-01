const express = require("express");
const {
  addDish,
  deleteDish,
  updateDish,
  addDishImages,
  getDishImages,
  deleteDishImage,
  getMenuByRestaurant
} = require("../controller/menu");
const { upload } = require("../multer");
const app = express();

app.post("/add-menu-dish", addDish);
app.post("/delete-menu-dish", deleteDish);
app.post("/add-menu-dish-images", upload.array("images"), addDishImages);
app.post("/get-dish-images", getDishImages);
app.post("/update-menu-dish", updateDish);
app.post("/delete-dish-image", deleteDishImage);
app.post("/get-menu-by-restaurant", getMenuByRestaurant);
module.exports = app;
