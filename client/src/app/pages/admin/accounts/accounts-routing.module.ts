import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AccountsPage } from "./accounts";

const routes: Routes = [
  {
    path: "",
    component: AccountsPage,
  },
  {
    path: "create-account",
    loadChildren: () =>
      import(
        "@app/pages/admin/accounts/create-account/create-account.module"
      ).then((m) => m.CreateAccountModule),
  },
  {
    path: "account-details/:accountId",
    loadChildren: () =>
      import(
        "@app/pages/admin/accounts/account-details/account-details.module"
      ).then((m) => m.AccountDetailsModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountsPageRoutingModule {}
