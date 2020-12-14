import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { StudentDetailsPage } from "./student-details";

const routes: Routes = [
  {
    path: "",
    component: StudentDetailsPage,
  },
  {
    path: "student-expenses/expense-details/:expenseId",
    loadChildren: () =>
      import(
        "@app/pages/reports-manager/expenses/expense-details/expense-details.module"
      ).then((m) => m.ExpenseDetailsModule),
  },
  {
    path: "student-expenses/add",
    loadChildren: () =>
      import(
        "@app/pages/reports-manager/expenses/add-student-expense/add-student-expense.module"
      ).then((m) => m.AddStudentExpenseModule),
  },
  {
    path: "report-details/:reportId",
    loadChildren: () =>
      import(
        "@app/pages/reports-manager/reports/report-details/report-details.module"
      ).then((m) => m.ReportDetailsModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentDetailsPageRoutingModule {}
