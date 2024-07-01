const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: { type: ObjectId, ref: "restaurants_categories", required: true },
  },
  { timestamps: true }
);

module.exports = model("sub_categories", schema);
