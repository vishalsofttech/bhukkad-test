const express = require("express");
const {
  createCatgory,
  deleteCategory,
  getCategories,
} = require("../controller/category");
const app = express.Router();

app.post("/create-category", createCatgory);
app.post("/delete-category", deleteCategory)
app.post("/get-categories",getCategories)
module.exports = app;
