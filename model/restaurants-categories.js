const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  restaurant: { type: ObjectId, ref: "restaurants", required: true },
},{timestamps:true});

module.exports = model("restaurants_categories", schema);
