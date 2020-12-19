const config = require("config.json");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("_helpers/send-email");
const db = require("_helpers/db");
const Role = require("_helpers/role");
const { CONNREFUSED } = require("dns");

module.exports = {
  authenticate,
  refreshToken,
  revokeToken,
  register,
  verifyEmail,
  forgotPassword,
  validateResetToken,
  resetPassword,
  getAll,
  getById,
  getByEmail,
  createAccount,
  update,
  delete: _delete,
  updateExpensesOnAccount,
  updateReportsOnAccount,
  getAllStudentsInReports,
  getReportsExpenses,
  getAllStudentsByReportId,
  getAllReportsManagers,
  getAllReportsManagerReports,
  getStudentsOnReport
};

async function authenticate({ email, password, ipAddress }) {
  const account = await db.Account.findOne({ email });

  //console.log(account,"Im finding the account")

  if (
    !account ||
    !account.isVerified ||
    !bcrypt.compareSync(password, account.passwordHash)
  ) {
    console.log("So whats wrong???");
    throw "Email or password is incorrect";
  }
  //TODO
  /*if(account.isOnline){
    throw "Account already logged in elsewhere..."
  }*/

  // authentication successful so generate jwt and refresh tokens
  const jwtToken = generateJwtToken(account);
  const refreshToken = await generateRefreshToken(account, ipAddress);

  // save refresh token

  await refreshToken.save();
  // track last log in
  account.lastLogin = Date.now();
  // track online status
  account.isOnline = true;
  await account.save();
  // return basic details and tokens
  return {
    ...basicDetails(account),
    jwtToken,
    refreshToken: refreshToken.token,
  };
}

async function refreshToken({ token, ipAddress }) {
  const refreshToken = await getRefreshToken(token);
  //console.log(refreshToken,'the refresh token')
  const { account } = refreshToken;

  // replace old refresh token with a new one and save
  const newRefreshToken = await generateRefreshToken(account, ipAddress);
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = await ipAddress;
  refreshToken.replacedByToken = await newRefreshToken.token;
  await refreshToken.save();
  await newRefreshToken.save();

  // generate new jwt
  const jwtToken = generateJwtToken(account);

  // return basic details and tokens
  return {
    ...basicDetails(account),
    jwtToken,
    refreshToken: newRefreshToken.token,
  };
}

// Being logged out either on own accord or JWT expired
async function revokeToken({ token, ipAddress }) {
  const refreshToken = await getRefreshToken(token);

  //updating isOnline to false, need more logic if just close browser etc.
  if (refreshToken.account) {
    const account = await db.Account.findOne({ _id: refreshToken.account.id });
    account.isOnline = false;
    await account.save();
  }

  // revoke token and save
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = await ipAddress;

  await refreshToken.save();
}

async function register(params, origin) {
  // validate
  if (await db.Account.findOne({ email: params.email })) {
    // send already registered error in email to prevent account enumeration
    return await sendAlreadyRegisteredEmail(params.email, origin);
  }
  // createAccount account object
  const account = new db.Account(params);
  // first registered account is an admin
  const isFirstAccount = (await db.Account.countDocuments({})) === 0;
  account.role = isFirstAccount
    ? Role.Admin
    : params.role == "ReportsManager"
    ? Role.ReportsManager
    : params.role == "Admin"
    ? Role.Admin
    : Role.Student;
  account.verificationToken = randomTokenString();
  // hash password
  account.passwordHash = hash(params.password);
  // save account
  await account.save();
  // create personal reports list
  const newPersonalReportsList = new db.PersonalReportsList({
    accountId: account.id,
  });
  //console.log(newPersonalReportsList, "???");
  await newPersonalReportsList.save();
  // send email
  await sendVerificationEmail(account, origin);
}

async function verifyEmail({ token }) {
  //console.log("getting here...tooveos",token)
  const account = await db.Account.findOne({ verificationToken: token });
  //console.log(account)
  if (!account) throw "Verification failed";

  account.verified = Date.now();
  account.verificationToken = undefined;
  await account.save();
}

async function forgotPassword({ email }, origin) {
  const account = await db.Account.findOne({ email });

  // always return ok response to prevent email enumeration
  if (!account) return;

  // createAccount reset token that expires after 24 hours
  account.resetToken = {
    token: randomTokenString(),
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
  await account.save();

  // send email
  await sendPasswordResetEmail(account, origin);
}

async function validateResetToken({ token }) {
  const account = await db.Account.findOne({
    "resetToken.token": token,
    "resetToken.expires": { $gt: Date.now() },
  });

  if (!account) throw "Invalid token";
}

async function resetPassword({ token, password }) {
  const account = await db.Account.findOne({
    "resetToken.token": token,
    "resetToken.expires": { $gt: Date.now() },
  });
  if (!account) throw "Invalid token";

  // update password and remove reset token
  account.passwordHash = hash(password);
  account.passwordReset = Date.now();
  account.resetToken = undefined;
  await account.save();
}

async function getAll() {
  //console.log('getting here');
  const accounts = await db.Account.find()
    .populate("studentExpenses")
    .populate("studentExpensesCount")
    .populate("studentReport")
    .populate("reportsManager")
    .populate("reportsManagerReports")
    .populate("reportsManagerExpenses")
    .populate("reportsManagerStudents")
    .populate("reportsManagerExpensesCount")
    .populate("reportsManagerStudentsCount");
  //console.log(accounts,'the accounts??')
  return await accounts.map((x) => basicDetails(x));
}

async function getAllStudentsInReports(reportsManagerId) {
  const allStudentsInReports = await db.Account.find({
    reportsManagerId: reportsManagerId,
  })
    .populate("studentExpenses")
    .populate("studentExpensesCount")
    .populate("studentReport")
    .populate("reportsManager")
    .populate("reportsManagerReports")
    .populate("reportsManagerExpenses")
    .populate("reportsManagerStudents")
    .populate("reportsManagerExpensesCount")
    .populate("reportsManagerStudentsCount");

  return allStudentsInReports.map((x) => basicDetails(x));
}

// 1.2.1 Getting all students and expenses total for SPECIFIC Report DATA
async function getStudentsOnReport(reportId) {
  // First get this Report Students List
  const reportStudentsList = await db.ReportStudentsList.findOne({
    reportId: reportId,
  });
  console.log(reportStudentsList,"the list??")
  // Loop through that List and calculate expenses for this report from each student
  const studentListArray = reportStudentsList.students;
  const studentCount = reportStudentsList.students.length;
  let studentsFullDetailsArray=[];
  console.log(studentCount,"The student count???")
  // For Each Student on The Report Students List, load the students full detail array
  for (let i = 0; i < studentCount; i++) {
    // get each student account
    studentsFullDetailsArray[i] = await db.Account.findOne({
      _id: studentListArray[i].accountId,
    })
      .populate("studentExpenses")
      .populate("studentExpensesCount");

      console.log(studentsFullDetailsArray[i],"The student??")

    let studentExpensesCount =
      studentsFullDetailsArray[i].studentExpenses.length;
    let studentExpenseTotal = 0;
    let studentExpensesCountNew = 0;
    // Calculate the Students total of expenses for THIS Report
    for (let y = 0; y < studentExpensesCount; y++) {
      if (studentsFullDetailsArray[i].studentExpenses[y].reportId == reportId) {
        studentExpenseTotal += Number(
          studentsFullDetailsArray[i].studentExpenses[y].expenseCost
        );
        studentExpensesCountNew++;
      }
    }
    studentsFullDetailsArray[i].expensesTotal = Number(
      studentExpenseTotal
    ).toFixed(2);
    studentsFullDetailsArray[i].studentExpensesCountOnReport = studentExpensesCountNew;
    // Only for the current report count...
    console.log(studentsFullDetailsArray,"AND THIS??");
  }
  return studentsFullDetailsArray.map((x) => basicDetails(x));
}

// Main funtion for the report details view
async function getAllStudentsByReportId(reportId) {
  const allStudentsOnReport = await db.Account.find({
    reportId: reportId,
  })
    .populate("studentExpenses")
    .populate("studentExpensesCount");

  const studentsCount = allStudentsOnReport.length;
  // for each student
  for (let i = 0; i < studentsCount; i++) {
    // for each students expenses
    let studentExpensesCount = allStudentsOnReport[i].studentExpenses.length;
    let studentExpenseTotal = 0;
    for (let y = 0; y < studentExpensesCount; y++) {
      studentExpenseTotal += Number(
        allStudentsOnReport[i].studentExpenses[y].expenseCost
      );
    }
    allStudentsOnReport[i].expensesTotal = Number(studentExpenseTotal).toFixed(
      2
    );
  }

  return allStudentsOnReport.map((x) => basicDetails(x));
}

// function to get all reports managers + admins list , I just want their Id + fName + lName
async function getAllReportsManagers() {
  const reportsManagers = db.Account.find(
    { role: { $in: ["Admin", "ReportsManager"] } },
    { firstName: 1, lastName: 1 }
  );
  return reportsManagers;
}

// function to get all reports manager reports I just want their Id + reportName
async function getAllReportsManagerReports(reportsManagerId) {
  const reportsManagerReports = db.Report.find(
    { reportsManagerId: reportsManagerId },
    { reportName: 1 }
  );
  return reportsManagerReports;
}

//right here, so this is finding all students while have a specefic reports manager id,
// then return array of ONLY those students expenses...
async function getReportsExpenses(reportsManagerId) {
  const allReportsAccounts = await db.Account.find({
    reportsManagerId: reportsManagerId,
  }).populate("studentExpenses");
  const accountsLength = await allReportsAccounts.length;
  let resultsArray = [];
  for (let i = 0; i < accountsLength; i++) {
    if (allReportsAccounts[i].studentExpenses.length != 0) {
      let expensesCountOfAccount = await allReportsAccounts[i].studentExpenses
        .length;
      for (let y = 0; y < expensesCountOfAccount; y++) {
        resultsArray.push(allReportsAccounts[i].studentExpenses[y]);
      }
    }
  }
  return resultsArray;
}

// used to check if account exists...
async function getByEmail(accountEmail) {
  const account = await db.Account.findOne({ email: accountEmail });
  if (account) {
    return basicDetails(account);
  }
  return null;
}

async function getById(id) {
  const account = await db.Account.findById(id)
    .populate("studentExpenses")
    .populate("studentExpensesCount")
    .populate("studentReport")
    .populate("reportsManager")
    .populate("reportsManagerReports")
    .populate("reportsManagerExpenses")
    .populate("reportsManagerStudents")
    .populate("reportsManagerExpensesCount")
    .populate("reportsManagerStudentsCount")
    .populate("personalReportsList");

  return basicDetails(account);
}

// Simultaniously create a personal reports list
async function createAccount(params) {
  // validate
  if (await db.Account.findOne({ email: params.email })) {
    throw 'Email "' + params.email + '" is already registered';
  }
  const account = new db.Account(params);
  account.verified = Date.now();
  // hash password
  account.passwordHash = hash(params.password);
  // save account
  await account.save();
  //console.log(account,"???what is this account???")
  // Create A New Personal Reports List Simultaniously
  const newPersonalReportsList = new db.PersonalReportsList({
    accountId: account.id,
  });
  //console.log(newPersonalReportsList, "???");
  await newPersonalReportsList.save();

  return basicDetails(account);
}

async function update(id, params) {
  const account = await getAccount(id);
  // console.log(account)
  // Later
  /*const doc = await db.Account.findOne({ email: params.email }).populate('ExpensesArray');
      console.log(doc,"HUGE TEST");
      console.log("REALLY???",doc.ExpensesArray,"HUGE TEST222");*/
  //console.log(params)

  // For setting and updating status of entity, Active, InActive, Archived, Deleted
  if (params.status) {
    const newParamObj = {
      status: { code: params.status, dateModified: Date.now() },
    };
    params = newParamObj;
  }
  if (
    params.email &&
    account.email !== params.email &&
    (await db.Account.findOne({ email: params.email }))
  ) {
    throw 'Email "' + params.email + '" is already taken';
  }
  // hash password if it was entered
  if (params.password) {
    params.passwordHash = hash(params.password);
  }

  // copy params to account and save

  await Object.assign(account, params);
  account.updated = Date.now();
  await account.save();
  return basicDetails(account);
}

// This Works!!! Not used currently
async function updateExpensesOnAccount(accountId, params) {
  const Expense = await new db.Expense(params);
  expense.updated = Date.now();
  await expense.save();
  const account = await getAccount(accountId);

  await account.expenses.push(expense);
  account.updated = Date.now();
  await account.save();
  return basicDetails(account);
}

// Should restrict this to only admins...
async function _delete(id) {
  const account = await getAccount(id);
  await account.remove();
}

// This maybe should be moved??? Im not currently utilizing this...
async function updateReportsOnAccount(accountId, params) {
  const report = await new db.Report(params);
  report.updated = Date.now();
  await report.save();
  const account = await getAccount(accountId);

  await account.reports.push(report);
  account.updated = Date.now();
  await account.save();
  return basicDetails(account);
}

async function _delete(id) {
  const account = await getAccount(id);
  await account.remove();
}

// helper functions

async function getAccount(id) {
  if (!db.isValidId(id)) throw "Account not found";
  const account = await db.Account.findById(id)
    .populate("studentExpenses")
    .populate("studentExpensesCount")
    .populate("reportsManager")
    .populate("reportsManagerReports")
    .populate("reportsManagerExpenses")
    .populate("reportsManagerStudents")
    .populate("reportsManagerExpensesCount")
    .populate("reportsManagerStudentsCount");
  if (!account) throw "Account not found";
  return account;
}

async function getRefreshToken(token) {
  const refreshToken = await db.RefreshToken.findOne({ token }).populate(
    "account"
  );

  if (!refreshToken || !refreshToken.isActive) throw "Invalid token";
  return refreshToken;
}

function hash(password) {
  return bcrypt.hashSync(password, 10);
}

function generateJwtToken(account) {
  // createAccount a jwt token containing the account id that expires in 15 minutes
  return jwt.sign({ sub: account.id, id: account.id }, config.secret, {
    expiresIn: "15m",
  });
}

function generateRefreshToken(account, ipAddress) {
  // createAccount a refresh token that expires in 7 days
  return new db.RefreshToken({
    account: account.id,
    token: randomTokenString(),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: ipAddress,
  });
}

function randomTokenString() {
  return crypto.randomBytes(40).toString("hex");
}

function basicDetails(account) {
  const {
    id,
    title,
    reportsManagerId,
    reportId,
    firstName,
    lastName,
    email,
    role,
    created,
    updated,
    isVerified,
    lastLogin,
    verificationToken, //<--- IDK if this is a good idea
    isOnline,
    status,
    studentExpenses,
    studentExpensesCount,
    studentReport,
    reportsManager,
    reportsManagerReports,
    reportsManagerReportsCount,
    reportsManagerExpenses,
    reportsManagerStudents,
    reportsManagerExpensesCount,
    reportsManagerStudentsCount,
    expensesTotal,
    personalReportsListId,
    personalReportsList,
    studentExpensesCountOnReport
  } = account;
  return {
    id,
    title,
    reportsManagerId,
    reportId,
    firstName,
    lastName,
    email,
    role,
    created,
    updated,
    isVerified,
    verificationToken, //<--- IDK if this is a good idea
    lastLogin,
    isOnline,
    status,
    studentExpenses,
    studentExpensesCount,
    studentReport,
    reportsManager,
    reportsManagerReports,
    reportsManagerReportsCount,
    reportsManagerExpenses,
    reportsManagerStudents,
    reportsManagerExpensesCount,
    reportsManagerStudentsCount,
    expensesTotal,
    personalReportsListId,
    personalReportsList,
    studentExpensesCountOnReport
  };
}

async function sendVerificationEmail(account, origin) {
  let message;
  if (origin) {
    const verifyUrl = `${origin}/account/verify-email?token=${account.verificationToken}`;
    message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
  } else {
    message = `<p>Please use the below token to verify your email address with the <code>/account/verify-email</code> api route:</p>
                   <p><code>${account.verificationToken}</code></p>`;
  }

  await sendEmail({
    to: account.email,
    subject: "Student Expenses App Invite- Verify Email",
    html: `<h4>Verify Email</h4>
               <p>You have been invited to join Student Expenses App!</p>
               <p>Please Note, the Default password is <b>StudentExpenses123</b><p>
               <p>It is important that you change it after you log in!<p>
               ${message}`,
  });
}

async function sendAlreadyRegisteredEmail(email, origin) {
  let message;
  if (origin) {
    message = `<p>If you don't know your password please visit the <a href="${origin}/account/forgot-password">forgot password</a> page.</p>`;
  } else {
    message = `<p>If you don't know your password you can reset it via the <code>/account/forgot-password</code> api route.</p>`;
  }

  await sendEmail({
    to: email,
    subject: "Student Expenses App - Email Already Registered",
    html: `<h4>Email Already Registered</h4>
               <p>Your email <strong>${email}</strong> is already registered.</p>
               ${message}`,
  });
}

async function sendPasswordResetEmail(account, origin) {
  let message;
  if (origin) {
    const resetUrl = `${origin}/reset-password?token=${account.resetToken.token}`;
    message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>`;
  } else {
    message = `<p>Please use the below token to reset your password with the <code>/reset-password</code> api route:</p>
                   <p><code>${account.resetToken.token}</code></p>`;
  }

  await sendEmail({
    to: account.email,
    subject: "Student Expenses App - Reset Password",
    html: `<h4>Reset Password Email</h4>
               ${message}`,
  });
}
