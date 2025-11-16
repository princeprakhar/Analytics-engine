const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const analyticsRoutes = require("./routes/analytics.routes");
//const eventRoutes = require("./routes/events.routes");

//const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);
//app.use("/api/analytics", eventRoutes);

// global error handler
//app.use(errorHandler);

module.exports = app;

