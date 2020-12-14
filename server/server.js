require("rootpath")();
const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Middlewares imported
const errorHandler = require("_middleware/error-handler");
const logger = require("./_middleware/logger");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// init middleware

// Used for logging each requst, remove for performance boost and Production
app.use(logger);
// Used for files uploads
app.use(express.static("uploads"));

// allow cors requests from any origin and with credentials
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);

// api routes
app.use("/accounts", require("./accounts/accounts.controller"));
app.use("/expenses", require("./expenses/expenses.controller"));
app.use("/reports", require("./reports/reports.controller"));
app.use("/storage", require("./images/images-service"));

// swagger docs route
app.use("/api-docs", require("_helpers/swagger"));

// global error handler
app.use(errorHandler);

// start server
const port =
  process.env.NODE_ENV === "production" ? process.env.PORT || 80 : 4000;
app.listen(port, () => {
  console.log("Server listening on port " + port);
});
