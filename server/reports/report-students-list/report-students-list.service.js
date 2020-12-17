const db = require("_helpers/db");

module.exports = {
  getByReportId,
  createReportStudentsList,
  updateReportStudentsList,
  delete: _delete,
};

async function getByReportId(reportId) {
    const reportStudentsList = await getreportStudentsList(reportId);
    return basicDetails(reportStudentsList);
  }

async function createReportStudentsList(params) {
  const reportStudentsList = new db.reportStudentsList(params);
  await reportStudentsList.save();
  return basicDetails(reportStudentsList);
}

async function updateReportStudentsList(id, params) {
  const reportStudentsList = await getReportStudentsList(id);

  Object.assign(reportStudentsList, params);

  reportStudentsList.updated = Date.now();
  await reportStudentsList.save();
  return basicDetails(reportStudentsList);
}

async function _delete(id) {
  //console.log("Im deleting reportStudentsList...");
  const reportStudentsList = await getReportStudentsList(id);
  // should I not await this???
  await reportStudentsList.remove();
}

async function getReportStudentsList(id){


};


function basicDetails(reportStudentsList) {
  const {
    id,
    students,
    created,
    updated
  } = reportStudentsList;
  return {
    id,
    students,
    created,
    updated
  };

}
