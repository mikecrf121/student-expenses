import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { AlertController } from "@ionic/angular";
import { first } from "rxjs/operators";
import { Location } from "@angular/common";
import * as moment from "moment";

import { Account, Expense } from "@app/_models";
import {
  AccountService,
  AlertService,
  ExpenseService,
  ReportService,
} from "@app/_services";

@Component({
  selector: "page-report-details",
  templateUrl: "report-details.html",
  styleUrls: ["./report-details.scss"],
})
export class ReportDetailsPage {
  accountId: string;
  reportId: string;
  report = { reportName: "" };
  reportExpenses = [];
  saving: boolean = true;
  loading: Promise<HTMLIonLoadingElement>;
  savingReport: Promise<HTMLIonLoadingElement>;
  currentRoute: string = this.router.url;
  deleting: Promise<HTMLIonLoadingElement>;
  reportName: string;
  reportExpensesCount: number = 0;
  reportStudentsCount: number;
  reportStudents: [Account] | any;
  userExpenses: [Expense];
  totalOfReportExpenses: number;
  totalOfReportExpensesString: string;
  calculatingDisbursementsLoader: Promise<HTMLIonLoadingElement>;
  reportCreated: string;
  reportsManager: Account | undefined;
  deadData = [0, 1, 2, 3, 4, 5, 6, 7, 8]; //skeleton
  data: boolean;
  disbursementResults: boolean;
  calculatingDisbursements: boolean;

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    public inAppBrowser: InAppBrowser,
    public reportService: ReportService,
    public alertCtrl: AlertController,
    public alertService: AlertService,
    public accountService: AccountService,
    public expenseService: ExpenseService,
    private _location: Location
  ) {}

  async ionViewDidEnter() {}

  async ionViewWillEnter() {
    this.loading = this.alertService.presentLoading("Admin Student Expenses");
    (await this.loading).present();
    this.data = false;
    this.calculatingDisbursements = false;
    // Reset because of weird behavior observed...
    this.totalOfReportExpenses = 0;
    this.accountId = this.accountService.accountValue.id;
    this.reportId = this.route.snapshot.paramMap.get("reportId");

    // This Chain can be split up later for lazy loading each section
    // Get Report Info
    (await this.reportService.getById(this.reportId))
      .forEach(async (Element) => {
        this.reportName = Element.reportName;
        this.reportsManager = Element.reportsManager;
        this.reportCreated = moment(Element.created).format(
          "MMM-DD-YYYY @HH:mm" // could get to the milli second or further if needed..
        );
      })
      .then(async () => {
        // Get Report Students
        (await this.accountService.getAllStudentsByReportId(this.reportId))
          .forEach(async (Elem) => {
            //console.log("All Report Students", Elem);
            this.reportStudents = Elem;
            const reportStudentCount = this.reportStudents.length;
            for (let i = 0; i < reportStudentCount; i++) {
              this.reportStudents[i].lastLogin
                ? (this.reportStudents[i].lastLogin = moment(
                    this.reportStudents[i].lastLogin
                  ).format("MMM-DD @HH:mm"))
                : "";
            }
          })
          .then(async () => {
            // Get Report Expenses
            (
              await this.expenseService.getAllExpensesByReportId(this.reportId)
            ).forEach(async (El) => {
              this.reportExpenses = El;
              this.reportExpensesCount = this.reportExpenses.length;
              for (let i = 0; i < this.reportExpensesCount; i++) {
                this.totalOfReportExpenses += Number(
                  this.reportExpenses[i].expenseCost
                );
                this.reportExpenses[i].created = moment(
                  this.reportExpenses[i].created
                ).format("MMM-DD @HH:mm");
              }

              this.totalOfReportExpensesString = this.totalOfReportExpenses.toLocaleString(
                "en-US",
                {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                }
              );
            });
          })
          .finally(async () => {
            // Might seem like a smoother transition doing this?
            this.data = true;
            setTimeout(async () => {
              (await this.loading).dismiss();
            }, 100);
          });
      });
  }

  async editReportAttribute(contextParameter: string) {
    // switch case so this is dynamic, pretty cool
    let popUpText: string;
    let currentValue: string;
    switch (contextParameter) {
      case "reportName": {
        popUpText = "Name (Optional)";
        currentValue = this.reportName;
        break;
      }
    }
    // then that value from the switch being fed here
    const alert = await this.alertCtrl.create({
      header: `Change Report ${popUpText}?`,
      buttons: [
        "Cancel",
        {
          text: "Ok",
          handler: async (data: any) => {
            this.savingReport = this.alertService.presentLoading(
              "Saving Report..."
            );
            (await this.savingReport).present();
            this.updateReportMasterList(data, popUpText);
          },
        },
      ],
      inputs: [
        {
          type: "text",
          name: `${contextParameter}`,
          value: `${currentValue}`,
          placeholder: `Report ${popUpText}`,
        },
      ],
    });
    alert.present();
  }

  private async updateReportMasterList(contextParamValue, popUpText:string) {
    (await this.reportService.update(this.reportId, contextParamValue))
      .pipe(first())
      .subscribe({
        next: async () => {
          (await this.savingReport).dismiss();
          this.alertService.createToastAlert(
            `Update To Report ${popUpText} Successful`,
            "success",
            8000
          );
          this.saving = false;
          this.ionViewWillEnter();
        },
        error: async (error) => {
          (await this.savingReport).dismiss();
          this.alertService.createToastAlert(
            `Update to Report ${popUpText} Failed...`,
            "warning",
            8000
          );
        },
      });
  }

  // Delete Report Functions
  async deleteAreYouSure() {
    const alert = await this.alertCtrl.create({
      header: "Delete Report",
      message:
        "Are You Sure you want to DELETE this Report??  This Action cannot be reversed.",
      buttons: [
        {
          text: "Cancel",
          handler: () => {},
        },
        {
          text: "DELETE",
          handler: async () => {
            await this.deleteReport();
          },
        },
      ],
    });
    // now present the alert on top of all other content
    await alert.present();
  }

  async deleteReport() {
    this.deleting = this.alertService.presentLoading("Deleting Report...");
    (await this.deleting).present();
    this.reportService
      .delete(this.reportId)
      .pipe(first())
      .subscribe({
        next: async () => {
          (await this.deleting).dismiss();
          this.alertService.createToastAlert(
            "Report Deleted Successfully!",
            "success",
            8000
          );
          this._location.back();
        },
        error: async (error) => {
          (await this.deleting).dismiss();
          this.alertService.createToastAlert(
            "Report Delete failed.....!",
            "danger",
            8000
          );
        },
      });
  }

  // Archive Report Functions

  // Archive Report Functions
  async archiveAreYouSure() {
    const alert = await this.alertCtrl.create({
      header: "Archive Report",
      message: "Are You Sure you want to Archive this Report??",
      buttons: [
        {
          text: "Cancel",
          handler: () => {},
        },
        {
          text: "Archive",
          handler: async () => {
            this.savingReport = this.alertService.presentLoading(
              "Archiving Report..."
            );
            (await this.savingReport).present();
            const statusObj = { status: "Archived" };
            await this.updateReportMasterList(statusObj, "Status");
          },
        },
      ],
    });
    // now present the alert on top of all other content
    await alert.present();
  }

  // Calculate Disbursements Per Student, TODO, pottentially make this a reusable global funtion?

  public async calculateDisbursements() {
    this.calculatingDisbursements = true;
    this.disbursementResults = false;
    this.calculatingDisbursementsLoader = this.alertService.presentLoading(
      "Calculating Disbursements..."
    );
    (await this.calculatingDisbursementsLoader)
      .present()
      .then(async () => {
        const studentCount = this.reportStudents.length;
        let averageOfExpenses = this.totalOfReportExpenses / studentCount;
        averageOfExpenses = Number(averageOfExpenses);
        // loop through each student and calculate what they owe or is owed from disbursement pot
        for (let i = 0; i < studentCount; i++) {
          let studentExpensesTotal = Number(
            this.reportStudents[i].expensesTotal
          );
          this.reportStudents[i].disbursementAmmount =
            averageOfExpenses - studentExpensesTotal;
          this.reportStudents[i].disbursementAmmountAbsoluteValue = Math.abs(
            this.reportStudents[i].disbursementAmmount
          );
          this.reportStudents[
            i
          ].disbursementAmmountAbsoluteValueCurrencyString = this.reportStudents[
            i
          ].disbursementAmmountAbsoluteValue.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
          });
        }
      })
      .finally(async () => {
        this.disbursementResults = true;
        (await this.calculatingDisbursementsLoader).dismiss();
      });
  }
}
