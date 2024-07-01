const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phoneno: {
      type: String,
      unique: true,
      required: true,
    },

    pan: {
      type: String,
      required: true,
      unique: true,
    },

    adhaar: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    idProof: {
      type: String,
      required: true,
    },
    proofKey: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = model("owners", schema);
