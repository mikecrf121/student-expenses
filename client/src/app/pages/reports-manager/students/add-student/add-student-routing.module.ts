import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AddStudentPage } from "./add-student";

const routes: Routes = [
  {
    path: "",
    component: AddStudentPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddStudentPageRoutingModule {}
