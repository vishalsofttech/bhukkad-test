const Router = require("express").Router();
const { CreateCombo,getCombos } = require("../controller/combos");

Router.post("/create-dish-combo", CreateCombo);
Router.post("/get-combos-by-restaurant", getCombos);


module.exports = Router;
