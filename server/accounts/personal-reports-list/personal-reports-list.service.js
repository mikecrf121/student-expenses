const db = require("../../_helpers/db");

module.exports = {
  getByStudentId,
  createPersonalReportsList,
  updatePersonalReportsList,
  delete: _delete,
};

async function getByStudentId(studentId) {
  const personalReportsList = await getpersonalReportsList(studentId);
  return basicDetails(personalReportsList);
}

async function createPersonalReportsList(params) {
  const personalReportsList = new db.personalReportsList(params);
  await personalReportsList.save();
  return basicDetails(personalReportsList);
}

async function updatePersonalReportsList(params) {
  const personalReportsList = await db.PersonalReportsList.findOne({
    accountId: params.accountId,
  });
  const report = await db.Report.findOne({_id:params.reportId});
  // So I can have the report name for when the student selects it when adding expenses.. TODO trim
  await personalReportsList.reports.push({ reportId: params.reportId, reportName:report.reportName });

  personalReportsList.updated = Date.now();
  await personalReportsList.save();
  return basicDetails(personalReportsList);
}

async function _delete(id) {
  //console.log("Im deleting personalReportsList...");
  const personalReportsList = await getpersonalReportsList(id);
  // should I not await this???
  await personalReportsList.remove();
}

async function getPersonalReportsList(id) {}

function basicDetails(personalReportsList) {
  const { id, reports, created, updated } = personalReportsList;
  return {
    id,
    reports,
    created,
    updated,
  };
}
