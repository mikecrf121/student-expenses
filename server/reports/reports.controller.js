const express = require("express");
const router = express.Router();
const Joi = require("joi");
// might turn this back on later, or use it in this controller
//const validateRequest = require('_middleware/validate-request');
const authorize = require("_middleware/authorize");
const Role = require("_helpers/role");
const reportService = require("./report.service");
// routes
router.get("/", authorize([Role.Admin]), getAll);
router.get("/:reportId", authorize(), getById);
router.get("/report-students-list/:reportId/:accountId/check-if-on", authorize(), onReportStudentsListChecker);
router.post("/", authorize(), create);
router.put("/:reportId", authorize(), update);
router.put("/report-students-list/:reportId/:accountId", authorize(),  updateReportStudentsList);
router.delete("/:reportId", authorize(), _delete);

module.exports = router;

function getAll(req, res, next) {
  reportService
    .getAll()
    .then((reports) => res.json(reports))
    .catch(next);
}

function getById(req, res, next) {
  reportService
    .getById(req.params.reportId)
    .then((report) => (report ? res.json(report) : res.sendStatus(404)))
    .catch(next);
}

// Checker if the account is already on the report students list
function onReportStudentsListChecker(req, res, next) {
  reportService
  .onReportStudentsListChecker(req.params)
  .then((onReportStudentsList) =>
    onReportStudentsList ? res.json(true) : res.json(false)
  )
  .catch(next);
}

function updateReportStudentsList(req, res, next) {
  reportService
    .updateReportStudentsList(req.params)
    .then((report) => res.json(report))
    .catch(next);
}


function create(req, res, next) {
  reportService
    .create(req.body)
    .then((report) => res.json(report))
    .catch(next);
}

function update(req, res, next) {
  reportService
    .update(req.params.reportId, req.body)
    .then((report) => res.json(report))
    .catch(next);
}

function _delete(req, res, next) {
  reportService
    .delete(req.params.reportId)
    .then(() => res.json({ message: "report deleted successfully" }))
    .catch(next);
}
