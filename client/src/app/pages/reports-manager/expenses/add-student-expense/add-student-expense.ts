import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ActionSheetController } from "@ionic/angular";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { NgForm } from "@angular/forms";
import { first } from "rxjs/operators";
import { Location } from '@angular/common';

import { ExpenseOptions } from "@app/_interfaces";
import { AccountService, AlertService, ExpenseService } from "@app/_services";
import { Account } from "@app/_models";

@Component({
  selector: "page-add-student-expense",
  templateUrl: "add-student-expense.html",
  styleUrls: ["./add-student-expense.scss"],
})
export class AddStudentExpensePage {
  account: Account = this.accountService.accountValue;
  submitted: boolean = false;
  currentRoute: string = this.router.url;

  addExpense: ExpenseOptions = {
    expenseName: "",
    expenseCost: "",
    expenseCategory: "",
  };
  loading: Promise<HTMLIonLoadingElement>;
  savingExpense: Promise<HTMLIonLoadingElement>;
  studentId: string;
  reportId: string;
  reportsManagerId: string;
  student: Account;
  backRoute: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private expenseService: ExpenseService,
    public actionSheetCtrl: ActionSheetController,
    public inAppBrowser: InAppBrowser,
    public alertService: AlertService,
    private location: Location
  ) {}

  async ionViewWillEnter() {
    this.loading = this.alertService.presentLoading("Student Expenses");
    (await this.loading)
      .present()
      .then(async () => {
        // This should never be null
        this.studentId = this.route.snapshot.paramMap.get("studentId");
        //console.log("this student id", this.studentId);
        // Possibly null if didnt get here through report details page
        this.reportId = this.route.snapshot.paramMap.get("reportId");
        //console.log("this report id", this.reportId);
        // Getting student info to create expense
        (await this.accountService.getById(this.studentId)).forEach(
          async (student) => {
            this.reportId = student.reportId;
            this.reportsManagerId = student.reportsManagerId;
          }
        );
      })
      .finally(async () => {
        (await this.loading).dismiss();
      });
  }

  async ionViewDidEnter() {}

  async onAddExpense(form?: NgForm) {
    this.savingExpense = this.alertService.presentLoading("Saving Expense!...");
    //console.log(form.value);
    (await this.savingExpense).present();
    this.submitted = true;
    // stop here if form is invalid
    // also have a currency validator working!
    const regex = /^\d+(?:\.\d{0,2})$/;
    const numStr = `${form.value.expenseCost}`;

    if (form.invalid || !regex.test(numStr)) {
      this.alertService.createToastAlert(
        "Add To Student Expenses Failed, Fields Are Invalid.....!",
        "danger",
        4000
      );
      setTimeout(async () => {
        (await this.savingExpense).dismiss();
      }, 300);
      return;
    }

    form.value.studentId = this.studentId;
    form.value.reportId = this.reportId;
    form.value.reportsManagerId = this.reportsManagerId;

    (await this.expenseService.create(form.value)).pipe(first()).subscribe({
      next: async () => {
        setTimeout(async () => {
          (await this.savingExpense).dismiss();
        }, 300);
        this.alertService.createToastAlert(
          "Added Student Expense Successfully!",
          "success",
          5000
        );
        this.location.back();
      },
      error: async (error) => {
        setTimeout(async () => {
          (await this.savingExpense).dismiss();
        }, 300);
        this.alertService.createToastAlert(
          "Add Student Expense Failed.....!",
          "danger",
          5000
        );
      },
    });
  }
}
