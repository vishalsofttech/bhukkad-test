const { model, Schema } = require("mongoose");

const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
  tableNo: {
    type: Number,
    required: true,
  },
  chairs: {
    type: Number,
    required: true,
  },

  restaurant: {
    type: ObjectId,
    ref: "restaurants",
    required: true,
  },
});

module.exports = model("table-and-chairs", schema);
