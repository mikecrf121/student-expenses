import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ReportsPage } from "./reports";

const routes: Routes = [
  {
    path: "",
    component: ReportsPage,
  },
  {
    path: "report-details/:reportId",
    loadChildren: () =>
      import(
        "@app/pages/admin/reports/report-details/report-details.module"
      ).then((m) => m.ReportDetailsModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsPageRoutingModule {}
