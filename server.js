const express = require("express");
const { connectDatabase } = require("./config/database");
// const swaggerFile = require("./swagger_output.json");
// // const swaggerUi = require("swagger-ui-express");
const { readdir } = require("fs");
const cors = require("cors");
require("dotenv").config()

const app = express();
const port = 5500;

app.use(cors());
app.use("/public", express.static("./public/uploads"));
app.use(express.json({ limit: "2mb" }));
// app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

readdir("./routes", (error, files) =>
  files.forEach((fileName) => app.use(require("./routes/" + fileName)))
);

connectDatabase()
  .then((res) => {
    const server = app.listen(port, () => {
      console.log(`...server is started ${port}`);
    });

    server.timeout = 3000;
  })
  .catch((err) => {
    console.log(err)
    console.log("database connection failed");
  });


