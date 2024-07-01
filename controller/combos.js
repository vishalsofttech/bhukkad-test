const CombosModel = require("../model/combos");
const MenuModel = require("../model/menu");
const { Types } = require("mongoose");

async function CreateCombo(req, res) {
  const { restaurantID, comboName, dishesIDs, percentage } = req.body;

  if (
    !restaurantID?.trim() ||
    !comboName?.trim() ||
    !Array.isArray(dishesIDs) ||
    !percentage
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingCombo = await CombosModel.findOne({ comboName });

    if (existingCombo) {
      return res
        .status(400)
        .json({ message: "This combo name already exists." });
    }

    const transformDishesIDs = dishesIDs.map((el) =>
      Types.ObjectId.createFromHexString(el)
    );

    const dishes = await MenuModel.aggregate([
      {
        $match: { _id: { $in: transformDishesIDs } },
      },
      {
        $project: {
          price: 1,
        },
      },
    ]);

    let sumOfDishesPrice = 0;

    dishes.forEach((el) => {
      sumOfDishesPrice += el.price;
    });

    const percentagePrice = (sumOfDishesPrice / 100) * percentage;

    const finalPrice = sumOfDishesPrice - percentagePrice;

    const combo = await new CombosModel({
      comboName,
      comboPrice: finalPrice,
      actualPrice: sumOfDishesPrice,
      discount: percentage,
      dishes: dishesIDs,
      restaurant: restaurantID,
      profit: percentagePrice,
    }).save();

    res.json({ data: combo });
  } catch (err) {
    res.status(400).json({ message: "Failed to create combo." });
  }
}

async function getCombos(req, res) {
  const { restaurantID } = req.body;

  if (!restaurantID?.trim()) {
    return res.status(400).json({ message: "RestaurantID is required." });
  }

  try {
    const combos = await CombosModel.aggregate([
      {
        $match: {
          restaurant: Types.ObjectId.createFromHexString(restaurantID),
        },
      },
      {
        $lookup: {
          from: "restaurants_menus",
          localField: "dishes",
          foreignField: "_id",
          as: "dishes",
        },
      },
      {
        $unwind: "$dishes",
      },

      {
        $lookup: {
          from: "dish-images",
          localField: "dishes._id",
          foreignField: "dish",
          as: "dishImages",
        },
      },

      {
        $group: {
          _id: "$_id",
          comboName: { $first: "$comboName" },
          comboPrice: { $first: "$comboPrice" },
          discount: { $first: "$discount" },
          actualPrice: { $first: "$actualPrice" },
          profit: { $first: "$profit" },
          dishes: {
            $push: {
              _id: "$dishes._id",
              dishName: "$dishes.dishName",
              price: "$dishes.price",
              dishImages: "$dishImages.url",
            },
          },
        },
      },

      {
        $project: {
          dishes: 1,
          comboName: 1,
          comboPrice: 1,
          discount: 1,
          actualPrice: 1,
          profit: 1,
        },
      },
    ]);
    res.json({ data: combos });
  } catch (err) {
    res.status(400).json({ message: "Failed to get combos." });
  }
}
module.exports = { CreateCombo, getCombos };
