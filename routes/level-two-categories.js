const Router = require("express").Router();
const {
  addLevelTwoCategory,
  deleteLevelTwoCategory,
  getLevelTwoCategories,
} = require("../controller/level-two-categories");

Router.post("/add-level-two-category", addLevelTwoCategory);
Router.get("/get-level-two-categories", getLevelTwoCategories);
Router.post("/delete-level-two-category", deleteLevelTwoCategory);
module.exports = Router;
