const OwnerModel = require("../model/owners");
const { S3bucketUpload } = require("../simple-storage-service/s3");
const { deleteImage } = require("../simple-storage-service/delete-object");
const RestaurantModel = require("../model/restaurants");

async function createOwner(req, res) {
  const { name, phoneno, pan, adhaar, email } = req.body;

  if (!name || !phoneno || !pan || !email || !adhaar) {
    return res
      .status(400)
      .json({ success: false, message: "All fields required" });
  }

  const existingOwner = await OwnerModel.findOne({
    $or: [{ phoneno }, { pan }, { email }, { adhaar }],
  });

  if (existingOwner) {
    return res.status(400).json({ message: "this details already used." });
  }

  const image = await S3bucketUpload(
    req.file,
    5,
    process.env.S3_ACCESS_KEY,
    process.env.S3_ACCESS_SECRET,
    process.env.S3_REGION,
    "bhukkadimages"
  );

  try {
    const owner = await new OwnerModel({
      name,
      adhaar,
      phoneno,
      pan,
      email,
      idProof: image.img,
      proofKey: image.Key,
    }).save();

    res.status(201).json({
      message: "Owner creation sucessfully",
      data: owner,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Owner creation failed!" });
  }
}

//todo delete associate restaurants and its images
async function activeOrDeactiveOwner(req, res) {
  const { ownerID, status } = req.body;

  if (!ownerID?.trim() || typeof status !== "boolean") {
    return res.status(400).json({message:"OwnerID and status is required."})
  }

  try {
    const owner = await OwnerModel.findById(ownerID);

    if (!owner) {
      return res.status(400).json({ message: "Restaurant not found." });
    }

    const updatedOwner = await OwnerModel.findByIdAndUpdate(
      ownerID,
      {
        active: status,
      },
      { new: true }
    );

    const updatedRestaurants = await RestaurantModel.updateMany(
      { owner: ownerID },
      { active: status }
    );

    res.json({
      message: `${status?"activation":"deactivation"} owner and its restaurant successfully.`,
      data: updatedOwner,
    });
  } catch (err) {
    res.status(400).json({ message: "Inactivation failed." });
  }
}

async function updateOwner(req, res) {
  const { name, phoneno, pan, adhaar, email, id } = req.body;

  if (!id?.trim()) {
    return res.status(400).json({ message: "OwnerID is required." });
  }

  try {
    const existingOwner = await OwnerModel.findById(id);

    if (!existingOwner) {
      return res.status(404).json({ message: "Record not found." });
    }

    let image;

    if (req.file) {
      const deletedImage = await deleteImage(
        "bhukkadimages",
        existingOwner.proofKey
      );

      image = await S3bucketUpload(
        req.file,
        5,
        process.env.S3_ACCESS_KEY,
        process.env.S3_ACCESS_SECRET,
        process.env.S3_REGION,
        "bhukkadimages"
      );
    }

    await OwnerModel.findByIdAndUpdate(id, {
      name,
      phoneno,
      pan,
      adhaar,
      email,
      proofKey: image ? image.Key : image,
      idProof: image ? image.img : image,
    });
    res.json({ message: "Successfully updated." });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Record already exists." });
    }

    res.status(400).json({ message: "Failed to update." });
  }
}

async function getAllOwners(req, res) {
  try {
    const owners = await OwnerModel.find();
    res.json({ owners });
  } catch (err) {
    res.status(400).json({ message: "Failed to get." });
  }
}

async function ownersSearch(req, res) {
  const { search } = req.body;

  const searchRegex = new RegExp(search, "i");

  if (search?.trim()) {
    const owners = await OwnerModel.find({
      $or: [
        { name: { $regex: searchRegex } },
        { pan: { $regex: searchRegex } },
      ],
    });
    res.json({ owners });
  } else {
    res.json({ owners: [] });
  }
}

async function getOwnerById(req, res) {
  const { ownerID } = req.body;

  if (!ownerID?.trim()) {
    return res.status(400).json({message:"OwnerID is required."})
  }

  try {
    const owner = await OwnerModel.findById(ownerID);
    if (!owner) {
      return res.status(400).json({ message: "Record not found." });
    }

    res.json({ owner });
  } catch (err) {
    res.status(400).json({ message: "Failed to get." });
  }
}

module.exports = {
  createOwner,
  activeOrDeactiveOwner,
  updateOwner,
  getAllOwners,
  getOwnerById,
  ownersSearch,
};
