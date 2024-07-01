const { Schema, model, Types } = require("mongoose");

const ObjectId = Types.ObjectId;

const schema = new Schema({
  comboName: String,
  dishes: [{ type: ObjectId, ref: "restaurants_menus" }],
  comboPrice: {
    type: Number,
    required: true,
  },
  restaurant: { type: ObjectId, ref: "restaurants" },
  discount: {
    type: Number,
    required: true,
  },
  actualPrice: {
    type: Number,
    required: true,
  },
  profit: {
    type: Number,
    required: true,
  },
});

module.exports = model("dishes-combos", schema);
