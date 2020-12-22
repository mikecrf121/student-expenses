const express = require("express");
const router = express.Router();
const Joi = require("joi");
const validateRequest = require("_middleware/validate-request");
const authorize = require("_middleware/authorize");
const Role = require("_helpers/role");
const accountService = require("./account.service");
const reportService = require("../reports/report.service");
const expenseService = require("../expenses/expense.service");

// routes for accounts services like login authenticate etc.
router.post("/authenticate",authenticateSchema, authenticate);
router.post("/register", /*registerSchema,*/ register);
router.post("/verify-email", verifyEmailSchema, verifyEmail);
router.post("/forgot-password", forgotPasswordSchema, forgotPassword);
router.post("/reset-password", resetPassword);
// Used for JWT's
router.post("/refresh-token", refreshToken);
router.post("/revoke-token", authorize(), revokeTokenSchema, revokeToken);
router.post(
  "/validate-reset-token",
  validateResetTokenSchema,
  validateResetToken
);
// main routes for accounts ***
router.get("/", authorize(Role.Admin), getAll);

// For specefic create account admin view
router.get(
  "/reports-managers-list",
  authorize(Role.Admin),
  getAllReportsManagers
);
router.get(
  "/:reportsManagerId/reports-manager-reports",
  authorize(Role.Admin),
  getAllReportsManagerReports
);
//
router.get("/:accountId", authorize(), getById);
router.get("/:accountEmail/by-email", authorize(), getByEmail);
router.get("/:reportId/report-students", authorize(), getAllStudentsByReportId);
// New on 1.2.1
router.get("/:reportId/report-students-by-report-id", authorize(), getStudentsOnReport);
router.post("/", createSchema, createAccount);
router.put("/:accountId", authorize(), update);
router.delete("/:accountId", authorize(), _delete);

// TODO routes to add Expenses BASIC FUNCTIONALITY, also TODO Authorize for all...
//router.put("/:accountId/Expenses/", authorize(), pushPetToAccount);
router.get("/:accountId/expenses/", authorize(), getAllExpensesOnAccount);

// reports Manager Routes
//router.put("/:accountId/Reports/", authorize(), pushreportsToAccount);
// Need to use db.reports find({})
router.get("/:reportsManagerId/reports/", authorize(), getAllReportsOnAccount);
router.get(
  "/:reportsManagerId/students/",
  authorize(),
  getAllStudentsInReports
);
router.get(
  "/:reportsManagerId/expenses-on-reports/",
  authorize(),
  getReportsExpenses
);
router.get(
  "/:reportsManagerId/reports-expenses/",
  authorize(),
  getAllExpensesInReports
);

router.put(
  "/personal-reports-list/:accountId/:reportId",
  authorize([Role.Admin, Role.ReportsManager]),
  updatePersonalReportsList
);

module.exports = router;

function getAllStudentsInReports(req, res, next) {
  //console.log(req)
  accountService
    .getAllStudentsInReports(req.params.reportsManagerId)
    .then((accounts) => res.json(accounts))
    .catch(next);
}

// New for 1.2.1 
function getStudentsOnReport(req, res, next) {
  //console.log(req)
  accountService
    .getStudentsOnReport(req.params.reportId)
    .then((accounts) => res.json(accounts))
    .catch(next);
}

// when adding to a personal reports list...
function updatePersonalReportsList(req, res, next) {
  accountService
    .updatePersonalReportsList(req.params)
    .then((PersonalReportsList) => res.json(PersonalReportsList))
    .catch(next);
}

function getAllStudentsByReportId(req, res, next) {
  //console.log(req)
  accountService
    .getAllStudentsByReportId(req.params.reportId)
    .then((accounts) => res.json(accounts))
    .catch(next);
}

function getReportsExpenses(req, res, next) {
  //console.log(req)
  accountService
    .getReportsExpenses(req.params.reportsManagerId)
    .then((accounts) => res.json(accounts))
    .catch(next);
}

function getAllReportsOnAccount(req, res, next) {
  reportService
    .getAllReportsOnAccount(req.params.reportsManagerId)
    .then((reports) => res.json(reports))
    .catch(next);
}

function getAllExpensesInReports(req, res, next) {
  expenseService
    .getAllExpensesInReports(req.params.reportsManagerId)
    .then((expenses) => res.json(expenses))
    .catch(next);
}

function getAllExpensesOnAccount(req, res, next) {
  //console.log(req.params)
  expenseService
    .getAllExpensesOnAccount(req.params.accountId)
    .then((Expenses) => res.json(Expenses))
    .catch(next);
}

function authenticateSchema(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function authenticate(req, res, next) {
  const { email, password } = req.body;
  const ipAddress = req.ip;
  accountService
    .authenticate({ email, password, ipAddress })
    .then(({ refreshToken, ...account }) => {
      setTokenCookie(res, refreshToken);
      res.json(account);
    })
    .catch(next);
}

function refreshToken(req, res, next) {
  const token = req.cookies.refreshToken;
  const ipAddress = req.ip;
  accountService
    .refreshToken({ token, ipAddress })
    .then(({ refreshToken, ...account }) => {
      setTokenCookie(res, refreshToken);
      res.json(account);
    })
    .catch(next);
}

function revokeTokenSchema(req, res, next) {
  //console.log(req)
  const schema = Joi.object({
    token: Joi.string().empty(""),
  });
  //console.log(schema)
  validateRequest(req, next, schema);
}

function revokeToken(req, res, next) {
  // accept token from request body or cookie
  const token = req.body.token || req.cookies.refreshToken;
  //console.log(token)
  const ipAddress = req.ip;
  //console.log(req.user)
  if (!token) return res.status(400).json({ message: "Token is required" });

  // Students + Reports Managers can revoke their own tokens and admins can revoke any tokens
  if (!req.user.ownsToken(token) && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  accountService
    .revokeToken({ token, ipAddress })
    .then(() => res.json({ message: "Token revoked" }))
    .catch(next);
}

function registerSchema(req, res, next) {
  //console.log("getting to register schema", req)
  const schema = Joi.object({
    title: Joi.string(),
    role: Joi.string(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    reportId: Joi.string(),
    reportsManagerId: Joi.string(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6),
    confirmPassword: Joi.string().valid(Joi.ref("password")),
    acceptTerms: Joi.boolean().valid(true),
  });
  validateRequest(req, next, schema);
}

function register(req, res, next) {
  //console.log(req)
  accountService
    .register(req.body, req.get("origin"))
    .then(() =>
      res.json({
        message:
          "Registration successful, please check your email for verification instructions",
      })
    )
    .catch(next);
}

function verifyEmailSchema(req, res, next) {
  const schema = Joi.object({
    token: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function verifyEmail(req, res, next) {
  accountService
    .verifyEmail(req.body)
    .then(() =>
      res.json({ message: "Verification successful, you can now login" })
    )
    .catch(next);
}

function forgotPasswordSchema(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  validateRequest(req, next, schema);
}

function forgotPassword(req, res, next) {
  accountService
    .forgotPassword(req.body, req.get("origin"))
    .then(() =>
      res.json({
        message: "Please check your email for password reset instructions",
      })
    )
    .catch(next);
}

function validateResetTokenSchema(req, res, next) {
  const schema = Joi.object({
    token: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function validateResetToken(req, res, next) {
  accountService
    .validateResetToken(req.body)
    .then(() => res.json({ message: "Token is valid" }))
    .catch(next);
}

function resetPassword(req, res, next) {
  accountService
    .resetPassword(req.body)
    .then(() =>
      res.json({ message: "Password reset successful, you can now login" })
    )
    .catch(next);
}

// Main Routes controllers
function getAll(req, res, next) {
  accountService
    .getAll()
    .then((accounts) => res.json(accounts))
    .catch(next);
}

// Route for getting list of reports managers (who could be admins) so both
function getAllReportsManagers(req, res, next) {
  accountService
    .getAllReportsManagers()
    .then((accounts) => res.json(accounts))
    .catch(next);
}
// Route for getting all of a reports manager reports, should probably be moved to reports controller/service
function getAllReportsManagerReports(req, res, next) {
  accountService
    .getAllReportsManagerReports(req.params.reportsManagerId)
    .then((reports) => res.json(reports))
    .catch(next);
}

// Checker to see if account already exists....
function getByEmail(req, res, next){
  //console.log(req.user);
  accountService
    .getByEmail(req.params.accountEmail)
    .then((account) => (account ? res.json(account) : res.json(null)))
    .catch(next);

}

function getById(req, res, next) {
  // Students can get their own account and admins can get any account
  //console.log(req.params,"????");
  /*if (
    req.params.accountId !== req.user.idd &&
    req.user.role !== Role.Admin
  ) {
    return res.status(401).json({ message: "Unauthorized" });
  }*/

  accountService
    .getById(req.params.accountId)
    .then((account) => (account ? res.json(account) : res.sendStatus(404)))
    .catch(next);
}

function createSchema(req, res, next) {
  const schema = Joi.object({
    title: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
    role: Joi.string()
      .valid(Role.Admin, Role.Student, Role.ReportsManager)
      .required(),
  });
  validateRequest(req, next, schema);
}

function createAccount(req, res, next) {
  accountService
    .createAccount(req.body)
    .then((account) => res.json(account))
    .catch(next);
}

// TODO currently not used..
function updateSchema(req, res, next) {
  const schemaRules = {
    title: Joi.string().empty(""),
    firstName: Joi.string().empty(""),
    lastName: Joi.string().empty(""),
    email: Joi.string().email().empty(""),
    password: Joi.string().min(6).empty(""),
    confirmPassword: Joi.string().valid(Joi.ref("password")).empty(""),
  };

  // only admins can update role.... req.user ... not req.student
  if (req.user.role === Role.Admin) {
    schemaRules.role = Joi.string()
      .valid(Role.Admin, Role.Student, Role.reportsManager)
      .empty("");
  }

  const schema = Joi.object(schemaRules).with("password", "confirmPassword");
  validateRequest(req, next, schema);
}

function update(req, res, next) {
  // Students can update their own account and admins can update any account, THIS IS SO IMPORTANT NOT ACCOUNT ID ITS ID FOR Student.id
  if (req.params.accountId !== req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({
      message: "Unauthorized update to someone else account, your bad",
    });
  }
  //console.log(req.params, req.body);
  accountService
    .update(req.params.accountId, req.body)
    .then((account) => res.json(account))
    .catch(next);
}

function _delete(req, res, next) {
  // Students can delete their own account and admins can delete any account,
  //console.log(req.user);
  if (req.params.accountId !== req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({
      message: "Unauthorized you tried deleting someone elses account",
    });
  }

  accountService
    .delete(req.params.accountId)
    .then(() => res.json({ message: "Account deleted successfully" }))
    .catch(next);
}

// helper functions

function setTokenCookie(res, token) {
  // createAccount cookie with refresh token that expires in 7 days
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
  res.cookie("refreshToken", token, cookieOptions);
}
