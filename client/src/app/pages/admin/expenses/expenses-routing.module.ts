import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ExpensesPage } from "./expenses";

const routes: Routes = [
  {
    path: "",
    component: ExpensesPage,
  },
  {
    path: "expense-details/:expenseId",
    loadChildren: () =>
      import(
        "@app/pages/admin/expenses/expense-details/expense-details.module"
      ).then((m) => m.ExpenseDetailsModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpensesPageRoutingModule {}
