const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    gst: {
      type: String,
      required: true,
    },
    fssai: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    address: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    tablesQuantity: {
      type: Number,
      required: true,
    },

    fssaiImages: {
      type: [{ key: String, url: String }],
    },

    gstImages: {
      type: [{ key: String, url: String }],
    },

    owner: {
      type: ObjectId,
      ref: "owners",
      required: true,
    },
    globalCategories: [{ type: ObjectId, ref: "global-categories" }],

    openingTime: {
      type: String,
      required: true,
    },

    closingTime: {
      type: String,
      required: true,
    },

    levelTwoCategories: [{ type: ObjectId, ref: "level-two-categories" }],
    
    heroImage: {
      type: {
        key: String,
        url:String
      },
      required:true
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const RestaurantModel = model("restaurants", schema);
RestaurantModel.collection.createIndex({ location: "2dsphere" });

module.exports = RestaurantModel;
