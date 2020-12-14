import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AddStudentExpensePage } from "./add-student-expense";

const routes: Routes = [
  {
    path: "",
    component: AddStudentExpensePage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddStudentExpensePageRoutingModule {}
