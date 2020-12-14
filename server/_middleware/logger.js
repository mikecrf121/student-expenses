const moment = require("moment");
// remove this from app.use in main server file for performance boost
const logger = (req, res, next) => {
  console.log(
    `${req.method}-${req.protocol}://${req.get("host")}${
      req.originalUrl
    }: ${moment().format()}`
  );
  next();
};

module.exports = logger;
