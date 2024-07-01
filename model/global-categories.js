const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("global-categories", schema);
