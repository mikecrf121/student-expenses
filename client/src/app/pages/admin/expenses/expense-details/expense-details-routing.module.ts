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
    path: "reports-manager-details/:accountId", //<----TODO if i cahange this to reportsmanagerID its wrong???
    loadChildren: () =>
      import(
        "@app/pages/admin/accounts/account-details/account-details.module"
      ).then((m) => m.AccountDetailsModule),
  },
  {
    path: "report-details/:reportId",
    loadChildren: () =>
      import(
        "@app/pages/admin/reports/report-details/report-details.module"
      ).then((m) => m.ReportDetailsModule),
  },
  {
    path: "student-details/:accountId",
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
export class ExpenseDetailsPageRoutingModule {}
