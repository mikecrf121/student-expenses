import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ExpensesListPage } from "./expenses-list";
const routes: Routes = [
  {
    path: "",
    component: ExpensesListPage,
  },
  {
    path: "expense-details/:expenseId",
    loadChildren: () =>
      import(
        "@app/pages/account/expenses/expense-details/expense-details.module"
      ).then((m) => m.ExpenseDetailsModule),
  },
  {
    path: "add",
    loadChildren: () =>
      import("@app/pages/account/expenses/add-expense/add-expense.module").then(
        (m) => m.AddExpenseModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpensesListPageRoutingModule {}
