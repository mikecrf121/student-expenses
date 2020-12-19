///// NEED TODO THIS

const express = require("express");
const router = express.Router();
const Joi = require("joi");
// might turn this back on later, or use it in this controller
//const validateRequest = require('_middleware/validate-request');
const authorize = require("_middleware/authorize");
const Role = require("_helpers/role");
const persoanlReportsListService = require("./personal-reports-list.service");
// routes
// Used to load the Report Details view potentially
router.get(
  "/:accountId",
  authorize(),
  getByAccountId
);
// Whenever a RM creates a report, this should be created concurently
router.post(
  "/",
  authorize([Role.Admin,Role.ReportsManager]),
  createPersonalReportsList
);
// Whenever students are added or deleted from a report
router.put(
  "/:accountId/:reportId",
  authorize([Role.Admin,Role.ReportsManager]),
  updatePersonalReportsList
);
// If the Report for whatever reason is deleted/Archived, this will go for the ride
router.delete(
  "/:accountId",
  authorize([Role.Admin,Role.ReportsManager]),
  _delete
);

module.exports = router;

function getByAccountId(req, res, next) {
  persoanlReportsListService
    .getByReportId(req.params.accountId)
    .then((PersonalReportsList) =>
      PersonalReportsList ? res.json(PersonalReportsList) : res.sendStatus(404)
    )
    .catch(next);
}

function createPersonalReportsList(req, res, next) {
  persoanlReportsListService
    .createPersonalReportsList(req.body)
    .then((PersonalReportsList) => res.json(PersonalReportsList))
    .catch(next);
}

// when adding to a personal reports list...
function updatePersonalReportsList(req, res, next) {
  persoanlReportsListService
    .updatePersonalReportsList(req.params)
    .then((PersonalReportsList) => res.json(PersonalReportsList))
    .catch(next);
}

function _delete(req, res, next) {
  persoanlReportsListService
    .delete(req.params.accountId)
    .then(() =>
      res.json({ message: "Personal Reports List deleted successfully" })
    )
    .catch(next);
}
