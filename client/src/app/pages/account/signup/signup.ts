import { Component } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { first } from "rxjs/operators";

import { UserData } from "@app/_providers";
import { UserOptions } from "@app/_interfaces";
import { AccountService, AlertService } from "@app/_services";

@Component({
  selector: "page-signup",
  templateUrl: "signup.html",
  styleUrls: ["./signup.scss"],
})
export class SignupPage {
  signup: UserOptions = {
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  };
  submitted: boolean = false;
  loading: boolean = false;
  signUpLoader: Promise<HTMLIonLoadingElement>;

  constructor(
    public router: Router,
    public userData: UserData,
    private accountService: AccountService,
    private alertService: AlertService
  ) {}

  async onSignup(form?: NgForm) {
    this.signUpLoader = this.alertService.presentLoading("Creating Account...");
    (await this.signUpLoader).present();
    this.submitted = true;
    // stop here if form is invalid
    if (form.value.title == "") {
      form.value.title = "N/A";
    }
    if (form.invalid) {
      (await this.signUpLoader).dismiss();
      return;
    }
    this.loading = true;

    form.value.confirmPassword = await form.value.password;
    (await this.accountService.register(form.value)).pipe(first()).subscribe({
      next: async () => {
        (await this.signUpLoader).dismiss();
        await this.alertService.createToastAlert(
          "Registration successful, please check your email for verification instructions",
          "success",
          5000
        );
        await this.userData.signup(this.signup.email).finally(async () => {
          await this.router.navigateByUrl("/login");
        });
      },
      error: async (error) => {
        (await this.signUpLoader).dismiss();
        await this.alertService.createToastAlert(
          "Registration Failed!",
          "danger",
          5000
        );
        (await this.signUpLoader).dismiss();
        this.loading = false;
      },
    });
  }
}
