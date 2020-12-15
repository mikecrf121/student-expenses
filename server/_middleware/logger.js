const moment = require("moment");
// remove this from app.use in main server file for performance boost
// TODO log response times
const logger = (req, res, next) => {
  console.log(
    `${req.method}-${req.protocol}://${req.get("host")}${
      req.originalUrl
    }: ${moment().format('M-d-y - hh:mm:ss.ms')}`
  );
  next();
};

module.exports = logger;
