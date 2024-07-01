const express = require("express");
const {
  createSubCategory,
  deleteSubCategory,
  getSubCategories
} = require("../controller/sub-categories");
const app = express.Router();

app.post("/create-sub-category", createSubCategory);
app.post("/delete-sub-category", deleteSubCategory);
app.post("/get-sub-categories", getSubCategories);
module.exports = app;
