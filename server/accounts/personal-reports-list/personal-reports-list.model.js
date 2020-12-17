const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    reports: { type: Array, required: false },
    created: { type: Date, default: Date.now },
    updated: Date,
  },
  // might not need this...
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// This lists' parent Account
schema.virtual("parentAccount", {
  ref: "Account", // The model to use
  localField: "_id", // Find people where `localField`
  foreignField: "personalReportsListId", // is equal to `foreignField`
  justOne: false,
});

module.exports = mongoose.model("PersonalReportsList", schema);
