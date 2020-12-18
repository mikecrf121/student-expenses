import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ActionSheetController } from "@ionic/angular";
import { NgForm } from "@angular/forms";
import { first } from "rxjs/operators";
import { Location } from "@angular/common";

import { AccountService, AlertService, ReportService } from "@app/_services";
import { ReportOptions } from "@app/_interfaces";

@Component({
  selector: "page-report-add",
  templateUrl: "add-report.html",
  styleUrls: ["./add-report.scss"],
})
export class AddReportPage {
  account = this.accountService.accountValue;
  submitted: boolean = false;
  currentRoute: string = this.router.url;
  addReport: ReportOptions = {
    reportName: "",
  };
  creatingReport: Promise<HTMLIonLoadingElement>;
  loading: Promise<HTMLIonLoadingElement>;

  constructor(
    private accountService: AccountService,
    private reportService: ReportService,
    private router: Router,
    public actionSheetCtrl: ActionSheetController,
    public alertService: AlertService,
    private route: ActivatedRoute,
    private _location: Location
  ) {}

  async ionViewDidEnter() {
    (await this.loading).dismiss();
  }

  async ionViewWillEnter() {
    this.loading = this.alertService.presentLoading("Student Expenses");
    (await this.loading).present();
  }

  async onAddReport(form?: NgForm) {
    this.creatingReport = this.alertService.presentLoading(
      "Creating Report..."
    );
    (await this.creatingReport).present();
    this.submitted = true;
    // stop here if form is invalid, not relevent here, only have optional name...
    if (form.invalid) {
      (await this.creatingReport).dismiss();
      this.alertService.createToastAlert(
        "Create Report failed, fields are invalid.....!",
        "danger",
        8000
      );
      return;
    }
    form.value.reportsManagerId = this.account.id;

    if (this.accountService.accountValue.role == "Admin") {
      //console.log(this.route.snapshot.paramMap.get("accountId"));
      form.value.reportsManagerId = this.route.snapshot.paramMap.get(
        "accountId"
      );

      if (this.route.snapshot.paramMap.get("accountId") == null) {
        form.value.reportsManagerId = this.account.id;
      }
    }

    (await this.reportService.create(form.value)).pipe(first()).subscribe({
      next: async () => {
        (await this.creatingReport).dismiss();
        this.alertService.createToastAlert(
          "Report Added Successfully!",
          "success",
          8000
        );
        this._location.back();
      },
      error: async (error) => {
        (await this.creatingReport).dismiss();
        this.alertService.createToastAlert(
          "Create Report failed.....!",
          "danger",
          8000
        );
      },
    });
  }
}
