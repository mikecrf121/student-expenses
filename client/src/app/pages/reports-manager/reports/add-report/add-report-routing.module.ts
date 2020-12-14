import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AddReportPage } from "./add-report";

const routes: Routes = [
  {
    path: "",
    component: AddReportPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddReportPageRoutingModule {}
