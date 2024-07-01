const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger_output.json";
const endpointsFiles = [
  "./routes/owner.js",
  "./routes/category.js",
  "./routes/menu.js",
  "./routes/restaurant.js",
  "./routes/sub-categories.js",
];

swaggerAutogen(outputFile, endpointsFiles);
