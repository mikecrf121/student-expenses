import { Component } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { first } from "rxjs/operators";
import { Location } from "@angular/common";

import { UserData } from "@app/_providers";
import { Account, Report } from "@app/_models";
import { UserOptions } from "@app/_interfaces";
import { AccountService, AlertService } from "@app/_services";

@Component({
  selector: "page-create-account",
  templateUrl: "create-account.html",
  styleUrls: ["./create-account.scss"],
})
export class CreateAccountPage {
  signup: UserOptions = {
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: true,
    role: "",
  };
  submitted: boolean = false;
  loading: boolean = false;
  allReportsManagers: [Account] | undefined | Account | any;
  allReportsManagerReports: [Report] | Report | any; // TODO fix this

  loadReportsManagersListDone: boolean = false;
  loadReportsManagerReportsListDone: boolean = false;
  signUpLoader: Promise<HTMLIonLoadingElement>;

  constructor(
    public router: Router,
    public userData: UserData,
    private accountService: AccountService,
    private alertService: AlertService,
    private _location: Location
  ) {}

  ionViewWillEnter() {
    // Could be loading something async on page coming into view
  }

  async onSignup(form?: NgForm) {
    this.signUpLoader = this.alertService.presentLoading("Creating Account...");
    (await this.signUpLoader).present();
    this.submitted = true;
    // stop here if form is invalid
    if (form.invalid) {
      (await this.signUpLoader).dismiss();
      return;
    }
    this.loading = true;
    //console.log(form.value, "The Form Value");
    form.value.password = "StudentExpenses123";
    if (form.value.title == "") {
      form.value.title = "N/A";
    }
    form.value.confirmPassword = form.value.password;
    form.value.acceptTerms = true;
    (this.accountService.register(form.value)).pipe(first()).subscribe({
      next: async () => {
        (await this.signUpLoader).dismiss();
        this.alertService.createToastAlert(
          `Email Sent To ${form.value.firstName} for verification instructions`,
          "success",
          5000
        );
        //await this.userData.signup(this.signup.email);
        this._location.back();
      },
      error: async (error) => {
        (await this.signUpLoader).dismiss();
        this.alertService.createToastAlert(
          "Email Invite Failed Failed!",
          "danger",
          5000
        );
        this.loading = false;
      },
    });
  }

  // Loading the list of Reports Managers & Admins because they can also be Reports Managers
  async loadReportsManagers(role: string) {
    if (role == "Student") {
      (this.accountService.getAllReportsManagers())
        .forEach(async (Element) => {
          this.allReportsManagers = Element;
        })
        .finally(async () => {
          this.loadReportsManagersListDone = true;
        });
    }
  }

  // Loading the List of Reports the Reports Manager Selected is responsible for
  async loadReportsManagerReports(reportsManagerId: string) {
    if (reportsManagerId != undefined) {
      (this.accountService.getAllReportsManagerReports(reportsManagerId))
        .forEach(async (Element) => {
          this.allReportsManagerReports = Element;
        })
        .finally(async () => {
          this.loadReportsManagerReportsListDone = true;
        });
    }
  }
}
