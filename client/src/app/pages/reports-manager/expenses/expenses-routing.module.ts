import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ExpensesListPage } from "./expenses";
const routes: Routes = [
  {
    path: "",
    component: ExpensesListPage,
  },
  {
    path: "add",
    loadChildren: () =>
      import(
        "@app/pages/reports-manager/reports/add-report/add-report.module"
      ).then((m) => m.AddReportModule),
  },
  {
    path: "expense-details/:expenseId",
    loadChildren: () =>
      import(
        "@app/pages/reports-manager/expenses/expense-details/expense-details.module"
      ).then((m) => m.ExpenseDetailsModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpensesListPageRoutingModule {}
