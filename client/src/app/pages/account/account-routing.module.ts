import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { Account } from "./account";

const routes: Routes = [
  {
    path: "",
    component: Account,
    children: [
      {
        path: "expenses",
        loadChildren: () =>
          import("@app/pages/account/expenses/expenses-list.module").then(
            (m) => m.ExpensesListModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {}
