const express = require("express");
const {upload} = require("../multer")

const {
  createOwner,
  activeOrDeactiveOwner,
  updateOwner,
  getAllOwners,
  getOwnerById,
  ownersSearch
} = require("../controller/owner");
const app = express.Router();


app.post("/create-owner", upload.single("idProof"), createOwner);
app.post("/active-deactive-owner", activeOrDeactiveOwner);
app.post("/update-owner", upload.single("idProof"), updateOwner);
app.get("/get-owners",getAllOwners);
app.post("/owners-by-id", getOwnerById);
app.post("/owners-search",ownersSearch)

module.exports = app;
