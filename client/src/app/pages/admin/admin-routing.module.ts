import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { Admin } from "./admin";

const routes: Routes = [
  {
    path: "",
    component: Admin,
    children: [
      {
        path: "accounts",
        loadChildren: () =>
          import("@app/pages/admin/accounts/accounts.module").then(
            (m) => m.AccountsModule
          ),
      },
      {
        path: "reports",
        loadChildren: () =>
          import("@app/pages/admin/reports/reports.module").then(
            (m) => m.ReportsModule
          ),
      },
      {
        path: "expenses",
        loadChildren: () =>
          import("@app/pages/admin//expenses/expenses.module").then(
            (m) => m.ExpensesModule
          ),
      },
      { path: "", redirectTo: "/admin/accounts", pathMatch: "full" },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
