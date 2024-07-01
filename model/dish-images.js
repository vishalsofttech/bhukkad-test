const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
  key: String,
  url: String,
  dish: {
    type: ObjectId,
    ref: "restaurants_menus",
  },
},{timestamps:true});

module.exports = model("dish-images", schema);
