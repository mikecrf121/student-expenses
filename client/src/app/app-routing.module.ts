import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "@app/_helpers";
import { LoggedInGuard } from "@app/_helpers";
import { Role } from "@app/_models";
import { VerifyEmailComponent } from "./pages/account/verify-email/verify-email.component";

const routes: Routes = [
  { path: "", redirectTo: "/home", pathMatch: "full" },
  {
    path: "home",
    loadChildren: () =>
      import("@app/pages/home/home.module").then((x) => x.HomePageModule),
  },
  {
    path: "admin",
    loadChildren: () =>
      import("@app/pages/admin/admin.module").then((m) => m.AdminModule),
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin] },
  },
  {
    path: "reports-manager",
    loadChildren: () =>
      import("@app/pages/reports-manager/reports-manager.module").then(
        (m) => m.ReportsManagerModule
      ),
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin, Role.ReportsManager] },
  },
  {
    path: "account",
    loadChildren: () =>
      import("@app/pages/account/account.module").then((m) => m.AccountModule),
    canActivate: [AuthGuard],
  },
  {
    path: "login",
    loadChildren: () =>
      import("@app/pages/account/login/login.module").then(
        (m) => m.LoginModule
      ),
    //canActivate: [LoggedInGuard],
  },
  {
    path: "signup",
    loadChildren: () =>
      import("@app/pages/account/signup/signup.module").then(
        (m) => m.SignUpModule
      ),
    canActivate: [LoggedInGuard],
  },
  {
    path: "forgot-password",
    loadChildren: () =>
      import("@app/pages/account/forgot-password/forgot-password.module").then(
        (m) => m.ForgotPasswordModule
      ),
    canActivate: [LoggedInGuard],
  },
  {
    path: "reset-password",
    loadChildren: () =>
      import("@app/pages/account/reset-password/reset-password.module").then(
        (m) => m.ResetPasswordModule
      ),
    canActivate: [LoggedInGuard],
  },
  {
    path: "support",
    loadChildren: () =>
      import("@app/pages/support/support.module").then((m) => m.SupportModule),
  },
  { path: "account/verify-email", component: VerifyEmailComponent },

  {
    path: "account/profile",
    loadChildren: () =>
      import("@app/pages/profile/profile.module").then((m) => m.ProfileModule),
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: "legacy" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
