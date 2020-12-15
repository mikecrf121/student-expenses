const express = require("express");
const router = express.Router();
const Joi = require("joi");
// Will turn this back on later, if i need to
const validateRequest = require('_middleware/validate-request');
const authorize = require("_middleware/authorize");
const Role = require("_helpers/role");
const expenseService = require("./expense.service");

// routes for expenses. proably going to have to update this to allow non admins to create expenses??? idk yet
router.get("/", authorize(Role.Admin), getAll);
router.get("/:id", authorize(), getById);
router.get("/:reportId/report-expenses", authorize(), getAllExpensesByReportId);
router.post("/", authorize(), create);
router.put("/:id", authorize(), update);
router.delete("/:id", authorize(), _delete);

module.exports = router;

function getAll(req, res, next) {
  expenseService
    .getAll()
    .then((expenses) => res.json(expenses))
    .catch(next);
}

function getById(req, res, next) {
  // users can get their own account and admins can get any account
  expenseService
    .getById(req.params.id)
    .then((expense) => (expense ? res.json(expense) : res.sendStatus(404)))
    .catch(next);
}

function getAllExpensesByReportId(req, res, next) {
  // users can get their own account and admins can get any account
  expenseService
    .getAllExpensesByReportId(req.params.reportId)
    .then((expenses) => (expenses ? res.json(expenses) : res.sendStatus(404)))
    .catch(next);
}

function create(req, res, next) {
  //console.log(req.body,"The body of the expense create request")
  expenseService
    .create(req.body)
    .then((expense) => res.json(expense))
    .catch(next);
}

function update(req, res, next) {
  // users can update their own account and admins can update any account
  expenseService
    .update(req.params.id, req.body)
    .then((expense) => res.json(expense))
    .catch(next);
}

function _delete(req, res, next) {
  expenseService
    .delete(req.params.id)
    .then(() => res.json({ message: "expense deleted successfully" }))
    .catch(next);
}
