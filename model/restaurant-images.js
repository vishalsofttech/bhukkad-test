const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
  key: String,
  url: String,
  restaurant: {
    type: ObjectId,
    ref: "restaurants",
  },
},{timestamps:true});

module.exports = model("restaurant-images", schema);
