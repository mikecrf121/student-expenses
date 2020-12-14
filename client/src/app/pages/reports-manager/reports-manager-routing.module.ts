import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ReportsManager } from "./reports-manager";

const routes: Routes = [
  {
    path: "",
    component: ReportsManager,
    children: [
      {
        path: "reports",
        loadChildren: () =>
          import("@app/pages/reports-manager/reports/reports.module").then(
            (m) => m.ReportsListModule
          ),
      },
      {
        path: "students",
        loadChildren: () =>
          import("@app/pages/reports-manager/students/students.module").then(
            (m) => m.StudentsListModule
          ),
      },
      {
        path: "reports-expenses",
        loadChildren: () =>
          import("@app/pages/reports-manager/expenses/expenses.module").then(
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
export class ReportsManagerRoutingModule {}
