const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Unified Analytics Engine API",
      version: "1.0.0",
      description: "API Documentation for Event Analytics Engine",
    },
  },
  apis: ["./src/routes/*.js"], // scan routes for docs
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = swaggerDocs;
