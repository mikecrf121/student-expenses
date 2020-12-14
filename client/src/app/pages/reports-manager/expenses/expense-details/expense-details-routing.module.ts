import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ExpenseDetailsPage } from "./expense-details";

const routes: Routes = [
  {
    path: "",
    component: ExpenseDetailsPage,
  },
  {
    path: "add-image",
    loadChildren: () =>
      import(
        "@app/pages/account/expenses/expense-image/expense-image.module"
      ).then((m) => m.ExpenseImagePageModule),
  },
  {
    path: "report-details/:reportId",
    loadChildren: () =>
      import(
        "@app/pages/reports-manager/reports/report-details/report-details.module"
      ).then((m) => m.ReportDetailsModule),
  },
  {
    path: "student-details/:studentId",
    loadChildren: () =>
      import(
        "@app/pages/reports-manager/students/student-details/student-details.module"
      ).then((m) => m.StudentDetailsModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpenseDetailsPageRoutingModule {}
