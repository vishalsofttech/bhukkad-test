const {Schema,model} = require("mongoose");
const ObjectId = Schema.Types.ObjectId;


const schema = new Schema({
  dishName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  // images: {
  //   type: [{key:String,url:String}],
  //   required: true,
  // },
  restaurant: { type: ObjectId, ref: "restaurants", required: true },
  category: { type: ObjectId, ref: "restaurants_categories", required: true },
  subCategory: { type: ObjectId, ref: "sub_categories" },
},{timestamps:true});

module.exports = model("restaurants_menus", schema);
