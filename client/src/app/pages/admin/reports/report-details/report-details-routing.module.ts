import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ReportDetailsPage } from "./report-details";

const routes: Routes = [
  {
    path: "",
    component: ReportDetailsPage,
  },
  {
    path: "student/add",
    loadChildren: () =>
      import(
        "@app/pages/reports-manager/students/add-student/add-student.module"
      ).then((m) => m.AddStudentModule),
  },
  {
    path: "students/student-details/:accountId",
    loadChildren: () =>
      import(
        "@app/pages/admin/accounts/account-details/account-details.module"
      ).then((m) => m.AccountDetailsModule),
  },
  {
    path: "reports-expenses/expense-details/:expenseId",
    loadChildren: () =>
      import(
        "@app/pages/admin/expenses/expense-details/expense-details.module"
      ).then((m) => m.ExpenseDetailsModule),
  },
  {
    path: "reports-manager-details/:accountId", //<----TODO if i cahange this to reportsmanagerID its wrong???
    loadChildren: () =>
      import(
        "@app/pages/admin/accounts/account-details/account-details.module"
      ).then((m) => m.AccountDetailsModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportDetailsPageRoutingModule {}
