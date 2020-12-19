const express = require("express");
const router = express.Router();
const Joi = require("joi");
// might turn this back on later, or use it in this controller
//const validateRequest = require('_middleware/validate-request');
const authorize = require("_middleware/authorize");
const Role = require("_helpers/role");
const reportStudentsListService = require("./report-students-list.service");
// routes
// Used to load the Report Details view potentially
router.get(
  "/:reportId",
  authorize(),
  getByReportId
);
// Check if Account on this reports' student list
router.get(
  "/:reportId/:accountId/check-if-on",
  authorize(),
  onReportStudentsListChecker
);
// Whenever a RM creates a report, this should be created concurently
router.post(
  "/",
  authorize(),
  createReportStudentsList
);
// Whenever students are added or deleted from a report
router.put(
  "/:reportId/:accountId",
  authorize(),
  updateReportStudentsList
);
// If the Report for whatever reason is deleted/Archived, this will go for the ride
router.delete("/:reportId", authorize(), _delete);

module.exports = router;

function getByReportId(req, res, next) {
  reportStudentsListService
    .getByReportId(req.params.reportId)
    .then((reportStudentsList) =>
      reportStudentsList ? res.json(reportStudentsList) : res.sendStatus(404)
    )
    .catch(next);
}

// Checker if the account is already on the report students list
function onReportStudentsListChecker(req, res, next) {
  reportStudentsListService
  .onReportStudentsListChecker(req.params)
  .then((onReportStudentsList) =>
    onReportStudentsList ? res.json(true) : res.json(false)
  )
  .catch(next);
}

function createReportStudentsList(req, res, next) {
  reportStudentsListService
    .createReportStudentsList(req.body)
    .then((reportStudentsList) => res.json(reportStudentsList))
    .catch(next);
}

function updateReportStudentsList(req, res, next) {
  reportStudentsListService
    .updateReportStudentsList(req.params)
    .then((reportStudentsList) => res.json(reportStudentsList))
    .catch(next);
}

function _delete(req, res, next) {
  reportStudentsListService
    .delete(req.params.reportId)
    .then(() =>
      res.json({ message: "Report Students List deleted successfully" })
    )
    .catch(next);
}
