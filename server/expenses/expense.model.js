const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    studentId: { type: String, required: true },
    reportId: { type: String, required: false },
    reportsManagerId: { type: String, required: false },
    expenseName: { type: String, required: true },
    expenseCost: { type: String, required: true },
    expenseCategory: { type: String, required: true },
    created: { type: Date, default: Date.now },
    updated: Date,
    status: {
      code: { type: String, required: true, default: "Active" },
      dateModified: { type: Date, default: Date.now() },
    },
    images: { type: Array, required: false },
  },

  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Need to change these to just one I believe, but more than one if future plans call for it, so leaving
schema.virtual("expenseStudent", {
  ref: "Account", // The model to use
  localField: "studentId", // Find people where `localField`
  foreignField: "_id", // is equal to `foreignField`
  justOne: false,
});

schema.virtual("expenseReport", {
  ref: "Report", // The model to use
  localField: "reportId", // Find people where `localField`
  foreignField: "_id", // is equal to `foreignField`
  justOne: false,
});

schema.virtual("expenseReportsManager", {
  ref: "Account", // The model to use
  localField: "reportsManagerId", // Find people where `localField`
  foreignField: "_id", // is equal to `foreignField`
  justOne: false,
});

schema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
  },
});

module.exports = mongoose.model("Expense", schema);
