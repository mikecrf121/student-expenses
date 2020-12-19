﻿const db = require("_helpers/db");

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: _delete,
  getAllReportsOnAccount,
};

async function getAll() {
  const report = await db.Report.find()
    //.populate("reportStudentsCount") REMOVED 1.2.1 //<-----Deprecated
    .populate("reportStudentsList")
    .populate("reportExpensesCount")
    .populate("reportsManager");


  return report.map((x) => basicDetails(x));
}

async function getById(id) {
  const report = await getReport(id);

  return basicDetails(report);
}

// When I create a new report, im also creating a report students list
async function create(params) {
  const report = new db.Report(params);
  await report
    .save()
    .then(async () => {
      const reportStudentsList = new db.ReportStudentsList({
        reportId: report.id,
      });
      await reportStudentsList.save();
    })
    .finally(async () => {
      return basicDetails(report);
    });
}

async function update(id, params) {
  const report = await getReport(id);
  // copy params to account and save

  // For setting and updating status of entity, Active, InActive, Archived, Deleted
  if (params.status) {
    const newParamObj = {
      status: { code: params.status, dateModified: Date.now() },
    };
    params = newParamObj;
  }

  Object.assign(report, params);

  report.updated = Date.now();
  await report.save();
  return basicDetails(report);
}

async function _delete(id) {
  //console.log("Im deleting Report...");
  const report = await getReport(id);
  // should I not await this???
  await report.remove();
}

// helper functions

async function getAllReportsOnAccount(reportsManagerId) {
  const reports = await db.Report.find({
    reportsManagerId: reportsManagerId,
  })
    .populate("reportStudentsCount")
    .populate("reportExpensesCount")
    .populate("reportStudentsList");
  return await reports;
}

async function getReport(id) {
  const report = await db.Report.findById(id)
    .populate("reportStudents")
    .populate("reportStudentsCount")
    .populate("reportExpenses")
    .populate("reportExpensesCount")
    .populate("reportsManager");

  //if (!Report) throw 'Report not found';
  return report;
}

function basicDetails(report) {
  const {
    id,
    reportsManagerId,
    reportsManager,
    reportName,
    reportStudents,
    reportStudentsCount, //<-----Deprecated, calculating on service function now instead of virtual
    reportStudentsList,
    reportExpensesCount,
    reportExpenses,
    created,
    status,
  } = report;
  return {
    id,
    reportsManagerId,
    reportsManager,
    reportName,
    reportStudents,
    reportStudentsCount, //<-----Deprecated
    reportStudentsList,
    reportExpensesCount,
    reportExpenses,
    created,
    status,
  };

  // TODO
  /**
   *  Get Reports Total Of Expenses
   * 
   * 
   async function calculateReportTotal(){
    //something sort of like the bellow
    let reportExpensesCount = 
    let reportExpenseTotal = 0;
    for (let y = 0; y < reportExpensesCount; y++) {
      studentExpenseTotal += Number(
        allStudentsOnReport[i].studentExpenses[y].expenseCost
      );
    }
    allStudentsOnReport[i].expensesTotal = Number(studentExpenseTotal).toFixed(2);
  }
};
   * 
   * 
   * 
   * 
   * 
   */
}
