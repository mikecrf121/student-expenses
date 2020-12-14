const db = require("_helpers/db");

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: _delete,
  getAllExpensesInReports,
  getAllExpensesOnAccount,
  getAllExpensesByReportId,
};
// Reports Manager All Expenses...
async function getAllExpensesInReports(reportsManagerId) {
  //console.log(reportsManagerId,'managerId')
  const expenses = await db.Expense.find({ reportsManagerId: reportsManagerId })
    .populate("expenseStudent")
    .populate("expenseReport");
  //console.log(expenses,'the expenses???')
  //console.log(Expenses)
  return expenses.map((x) => basicDetails(x));
}
// Personal Account Expenses
async function getAllExpensesOnAccount(accountId) {
  const expenses = await db.Expense.find({ studentId: accountId });
  //console.log(expenses)
  return expenses.map((x) => basicDetails(x));
}
// Admin All Expenses
async function getAll() {
  const expenses = await db.Expense.find()
    .populate("expenseStudent")
    .populate("expenseReport");
  return expenses.map((x) => basicDetails(x));
}
//
async function getAllExpensesByReportId(reportId) {
  const expenses = await db.Expense.find({ reportId: reportId }).populate(
    "expenseStudent"
  );
  return expenses.map((x) => basicDetails(x));
}

// Single expense get
async function getById(id) {
  const expense = await getExpense(id);
  return basicDetails(expense);
}
// Create single expense
async function create(params) {
  const expense = new db.Expense(params);
  await expense.save();
  return basicDetails(expense);
}
// Update single expense
async function update(id, params) {
  //console.log(params,"here")
  const expense = await getExpense(id);
  // copy params to account and save
  //console.log(expense,'getting expense back')

  // For setting and updating status of entity, Active, InActive, Archived, Deleted
  if (params.status) {
    const newParamObj = {
      status: { code: params.status, dateModified: Date.now() },
    };
    params = newParamObj;
  }
  Object.assign(expense, params);
  expense.updated = Date.now();
  await expense.save();
  return basicDetails(expense);
}
// Delete single expense
async function _delete(id) {
  const expense = await getExpense(id);
  await expense.remove();
}
// helper functions
async function getExpense(id) {
  const expense = await db.Expense.findById(id)
    .populate("expenseStudent")
    .populate("expenseReport")
    .populate("expenseReportsManager");
  //if (!expense) throw "Expense not found";
  return expense;
}
// Can make multiple of these later to return only what is needed for the view
// example: advanced details, or details for such and such page
function basicDetails(expense) {
  const {
    id,
    studentId,
    reportId,
    reportsManagerId,
    expenseName,
    expenseCost,
    expenseCategory,
    created,
    updated,
    status,
    expenseStudent,
    expenseReport,
    expenseReportsManager,
  } = expense;
  return {
    id,
    studentId,
    reportId,
    reportsManagerId,
    expenseName,
    expenseCost,
    expenseCategory,
    created,
    updated,
    status,
    expenseStudent,
    expenseReport,
    expenseReportsManager,
  };
}
