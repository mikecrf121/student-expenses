const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    students: { type: Array, required: false },
    created: { type: Date, default: Date.now },
    updated: Date,
  },
  // might not need this...
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// This lists' parent Report
schema.virtual("parentReport", {
  ref: "Report", // The model to use
  localField: "_id", // Find people where `localField`
  foreignField: "reportStudentsListId", // is equal to `foreignField`
  justOne: false,
});
// Might rename later, as it might not just be "Students" on the list
module.exports = mongoose.model("ReportStudentsList", schema);
