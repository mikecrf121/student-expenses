const db = require("../../_helpers/db");

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
  const reportStudentsList = new db.ReportStudentsList(params);
  await reportStudentsList.save();
  return basicDetails(reportStudentsList);
}

// ergo adding to this.....
async function updateReportStudentsList(params) {
  console.log(params.reportId,"what is the params??");
  const reportStudentsList = await db.ReportStudentsList.findOne({reportId: params.reportId}); 
  
  //({reportId:'5fcb41679863e5b01287e39d'});

  console.log(reportStudentsList,'able to find the report students list???')
  await reportStudentsList.students.push({accountId:params.accountId});

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

async function getReportStudentsList(params){


};


function basicDetails(reportStudentsList) {
  const {
    id,
    reportId,
    students,
    created,
    updated
  } = reportStudentsList;
  return {
    id,
    reportId,
    students,
    created,
    updated
  };

}
