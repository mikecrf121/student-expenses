const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    email: { type: String, unique: true, required: true },
    reportsManagerId: { type: String, required: false },
    personalReportsList: { type: Array, required: false }, // This instead of creating a whole new doc collection...
    reportId: { type: String, required: false },
    passwordHash: { type: String, required: true },
    title: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    acceptTerms: Boolean,
    role: { type: String, required: true },
    status: {
      code: { type: String, required: true, default: "Active" },
      dateModified: { type: Date, default: Date.now() },
    },
    verificationToken: String,
    verified: Date,
    resetToken: {
      token: String,
      expires: Date,
    },
    passwordReset: Date,
    created: { type: Date, default: Date.now },
    lastLogin: Date,
    isOnline: { type: Boolean, default: false },
    updated: Date,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

schema.virtual("isVerified").get(function () {
  return !!(this.verified || this.passwordReset);
});

/* DEPRECATED
schema.virtual("personalReportsList", {
  ref: "PersonalReportsList", // The model to use
  localField: "_id", // Find people where `localField`
  foreignField: "accountId", // is equal to `foreignField`
  justOne: true,
});*/

// My Expenses as a Expense Owner
schema.virtual("studentExpenses", {
  ref: "Expense", // The model to use
  localField: "_id", // Find people where `localField`
  foreignField: "studentId", // is equal to `foreignField`
  justOne: false,
});

schema.virtual("studentExpensesCount", {
  ref: "Expense", // The model to use
  localField: "_id", // Find people where `localField`
  foreignField: "studentId", // is equal to `foreignField`
  justOne: false,
  count: true,
});

schema.virtual("studentReport", {
  ref: "Report", // The model to use
  localField: "reportId", // Find people where `localField`
  foreignField: "_id", // is equal to `foreignField`
  justOne: true,
});
// My Reports if I am A Report Manager
schema.virtual("reportsManagerReports", {
  ref: "Report", // The model to use
  localField: "_id", // Find people where `localField`
  foreignField: "reportsManagerId", // is equal to `foreignField`
  justOne: false,
});

schema.virtual("reportsManager", {
  ref: "Account", // The model to use
  localField: "reportsManagerId", // Find people where `localField`
  foreignField: "_id", // is equal to `foreignField`
  justOne: true,
});

schema.virtual("reportsManagerReportsCount", {
  ref: "Report", // The model to use
  localField: "_id", // Find people where `localField`
  foreignField: "reportsManagerId", // is equal to `foreignField`
  justOne: false,
  count: true,
});
// Expenses In My Reports if I am A Report Manager
schema.virtual("reportsManagerExpenses", {
  ref: "Expense", // The model to use
  localField: "_id", // Find people where `localField`
  foreignField: "reportsManagerId", // is equal to `foreignField`
  justOne: false,
});
// Expense Owners In My Reports if I am A Report Manager
schema.virtual("reportsManagerStudents", {
  ref: "Account", // The model to use
  localField: "_id", // Find people where `localField`
  foreignField: "reportsManagerId", // is equal to `foreignField`
  justOne: false,
});

schema.virtual("reportsManagerExpensesCount", {
  ref: "Expense", // The model to use
  localField: "_id", // Find people where `localField`
  foreignField: "reportsManagerId", // is equal to `foreignField`
  justOne: false,
  count: true,
});
// Expense Owners In My Reports if I am A Report Manager
schema.virtual("reportsManagerStudentsCount", {
  ref: "Account", // The model to use
  localField: "_id", // Find people where `localField`
  foreignField: "reportsManagerId", // is equal to `foreignField`
  justOne: false,
  count: true,
});

schema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
    delete ret.passwordHash;
  },
});

module.exports = mongoose.model("Account", schema);
