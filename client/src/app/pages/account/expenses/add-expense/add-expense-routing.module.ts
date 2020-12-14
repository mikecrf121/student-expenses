import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AddExpensePage } from "./add-expense";

const routes: Routes = [
  {
    path: "",
    component: AddExpensePage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddExpensePageRoutingModule {}
