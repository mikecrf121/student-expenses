import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ActionSheetController } from "@ionic/angular";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { NgForm } from "@angular/forms";
import { first } from "rxjs/operators";
import { Location } from "@angular/common";

import { AccountService, AlertService, ExpenseService } from "@app/_services";
import { ExpenseOptions } from "@app/_interfaces";
import { Account } from "@app/_models";

@Component({
  selector: "page-add-expense",
  templateUrl: "add-expense.html",
  styleUrls: ["./add-expense.scss"],
})
export class AddExpensePage {
  account: Account;
  submitted: boolean = false;

  addExpense: ExpenseOptions = {
    reportId:"",
    expenseName: "",
    expenseCost: "",
    expenseCategory: "",
  };
  loading: Promise<HTMLIonLoadingElement>;
  savingExpense: Promise<HTMLIonLoadingElement>;
  accountId: string;
  personalReportsList: any;
  acctFetched: Account;

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private expenseService: ExpenseService,
    public actionSheetCtrl: ActionSheetController,
    public inAppBrowser: InAppBrowser,
    public alertService: AlertService,
    private _location: Location
  ) {}

  async ionViewWillEnter() {
    this.loading = this.alertService.presentLoading("Student Expenses");
    (await this.loading).present();
    this.account = null;
    this.account = this.accountService.accountValue;
    //console.log(this.account,"The account???")

    this.accountId = this.route.snapshot.paramMap.get("accountId"); //<----------potentially null for regular students
    let acctId: string;
    this.accountId ? (acctId = this.accountId) : (acctId = this.account.id);
    //<------------------- Admin Is Adding Expense for somebody
    //form.value.studentId = this.accountId;
    (this.accountService.getById(acctId))
      .forEach(async (Element) => {
        // Replace this with their personal reports list....
        //console.log(Element);
        this.acctFetched = Element;
        this.personalReportsList = Element.personalReportsList;
        //console.log(this.personalReportsList);
      })
      .finally(() => {
        setTimeout(async () => {
          (await this.loading).dismiss();
        }, 100);
      });
  }

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
        "Add To Expenses Failed, Fields Are Invalid.....!",
        "danger",
        4000
      );
      setTimeout(async () => {
        (await this.savingExpense).dismiss();
      }, 300);
      return;
    }
    form.value.reportsManagerId = this.acctFetched.reportsManagerId;
    form.value.studentId = this.acctFetched.id;
    //console.log(form.value);
    (this.expenseService.create(form.value)).pipe(first()).subscribe({
      next: async () => {
        setTimeout(async () => {
          (await this.savingExpense).dismiss();
        }, 300);
        this.alertService.createToastAlert(
          "Added Expense Successfully!",
          "success",
          5000
        );
        this._location.back();
      },
      error: async (error) => {
        setTimeout(async () => {
          (await this.savingExpense).dismiss();
        }, 300);
        this.alertService.createToastAlert(
          "Add Expense Failed.....!",
          "danger",
          5000
        );
      },
    });
  }
}
