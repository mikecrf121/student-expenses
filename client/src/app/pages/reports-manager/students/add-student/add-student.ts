import { Component } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";
import { UserData } from "@app/_providers/user-data";
import { Location } from "@angular/common";

import { UserOptions } from "@app/_interfaces";
import { AccountService, AlertService, ReportService } from "@app/_services";
import { Account } from "@app/_models";

@Component({
  selector: "page-add-student",
  templateUrl: "add-student.html",
  styleUrls: ["./add-student.scss"],
})
export class AddStudentPage {
  signup: UserOptions = {
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    acceptTerms: false,
    reportId: "",
    reportsManagerId: "",
    password: "",
    confirmPassword: "",
  };
  submitted: boolean = false;

  accountId: string;
  reportId: string;
  saving: boolean = true;
  loading: Promise<HTMLIonLoadingElement>;
  addingStudent: Promise<HTMLIonLoadingElement>;
  reportsManagerId: string;
  reportsManager: Account;
  currentRoute: string = this.router.url;

  constructor(
    public route: ActivatedRoute,
    public alertService: AlertService,
    public accountService: AccountService,
    private userData: UserData,
    private reportService: ReportService,
    private _location: Location,
    private router: Router
  ) {}

  async ionViewWillEnter() {
    this.loading = this.alertService.presentLoading("Student Expenses App");
    (await this.loading).present();
    this.reportId = this.route.snapshot.paramMap.get("reportId");
    // get report, then the reportManagerId
    (await this.reportService.getById(this.reportId))
      .forEach(async (Element) => {
        this.reportsManagerId = Element.reportsManagerId;
      })
      .finally(async () => {
        setTimeout(async () => {
          (await this.loading).dismiss();
        }, 300);
      });

    if (this.accountService.accountValue.role != "Admin") {
      window.history.replaceState(
        {},
        document.title,
        "/" + "reports-manager/reports/report-details/students/add"
      );
    }
  }

  async ionViewDidEnter() {}

  async onAddStudent(form?: NgForm) {
    this.addingStudent = this.alertService.presentLoading("Adding Student;");
    (await this.addingStudent).present();
    this.submitted = true;
    // stop here if form is invalid
    if (form.invalid) {
      (await this.addingStudent).dismiss();
      return;
    }
    // creating variables for default account
    form.value.reportsManagerId = this.reportsManagerId;
    form.value.reportId = this.reportId;
    form.value.password = "StudentExpenses123";
    form.value.confirmPassword = "StudentExpenses123";

    if (!form.value.title) {
      form.value.title = "N/A";
    }

    (await this.accountService.register(form.value)).pipe(first()).subscribe({
      next: async () => {
        //TODO Replace with toast alert
        await this.alertService
          .createToastAlert(
            "Invite Email To Student Sent Successfully",
            "success",
            5000
          )
          .then(async () => {
            await this.userData.signup(this.signup.email);
          })
          .finally(async () => {
            this._location.back();
            (await this.addingStudent).dismiss();
          });
      },
      error: async (error) => {
        await this.alertService.createToastAlert(
          "Invite Email Sent Failed!",
          "danger",
          5000
        );
        (await this.addingStudent).dismiss();
      },
    });
  }
}
