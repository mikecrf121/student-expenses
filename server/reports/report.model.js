const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    reportsManagerId: { type: String, required: true },
    reportStudentsListId: { type: String, required: false }, // starting so students can have multiple reports
    reportName: { type: String, required: false },
    status: {
      code: { type: String, required: true, default: "Active" },
      dateModified: { type: Date, default: Date.now() },
    },
    created: { type: Date, default: Date.now() },
    updated: Date,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

schema.virtual("reportStudents", {
  ref: "Account", // The model to use
  localField: "_id", // Find people where `localField`
  foreignField: "reportId", // is equal to `foreignField`
  justOne: false,
});

// The Reports Manager for the Report

schema.virtual("reportsManager", {
  ref: "Account", // The model to use
  localField: "reportsManagerId", // Find people where `localField`
  foreignField: "_id", // is equal to `foreignField`
  justOne: true,
});

schema.virtual("reportStudentsCount", {
  ref: "Account", // The model to use
  localField: "_id", // Find people where `localField`
  foreignField: "reportId", // is equal to `foreignField`
  count: true,
});

schema.virtual("reportExpenses", {
  ref: "Expense", // The model to use
  localField: "_id", // Find expense where `localField`
  foreignField: "reportId", // is equal to `foreignField`
  justOne: false,
});

schema.virtual("reportExpensesCount", {
  ref: "Expense", // The model to use
  localField: "_id", // Find expense where `localField`
  foreignField: "reportId", // is equal to `foreignField`
  count: true,
});

schema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
  },
});

module.exports = mongoose.model("Report", schema);
