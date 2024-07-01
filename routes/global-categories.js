
const Router = require("express").Router();
const {addGlobalCategory,getGlobalCategories,deleteGlobalCategory} = require("../controller/global-categories")
const {upload} = require("../multer")

Router.post("/create-global-category", upload.single("image"), addGlobalCategory);
Router.get("/get-global-categories",getGlobalCategories)
Router.post("/delete-global-category", deleteGlobalCategory);
module.exports = Router