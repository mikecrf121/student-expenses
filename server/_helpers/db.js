const config = require("config.json");
const mongoose = require("mongoose");
const connectionOptions = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};
mongoose.connect(
  process.env.MONGODB_URI || config.connectionString,
  connectionOptions
);
mongoose.Promise = global.Promise;

module.exports = {
  Account: require("accounts/account.model"),
  PersonalReportsList: require("accounts/personal-reports-list/personal-reports-list.model"),
  Expense: require("expenses/expense.model"),
  Report: require("reports/report.model"),
  ReportStudentsList: require("reports/report-students-list/report-students-list.model"),

  RefreshToken: require("accounts/refresh-token.model"),
  isValidId,
};

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}
