import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { CreateAccountPage } from "./create-account";

const routes: Routes = [
  {
    path: "",
    component: CreateAccountPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateAccountPageRoutingModule {}
