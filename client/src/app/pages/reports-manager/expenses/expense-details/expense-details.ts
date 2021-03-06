import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { Location } from "@angular/common";
import {
  AlertController,
  IonRouterOutlet,
  ModalController,
} from "@ionic/angular";
import { first } from "rxjs/operators";
import * as moment from "moment";

import { Account, Report } from "@app/_models";
import { AccountService, AlertService, ExpenseService } from "@app/_services";

const STORAGE_KEY = "my_images";
@Component({
  selector: "page-expense-details",
  templateUrl: "expense-details.html",
  styleUrls: ["./expense-details.scss"],
})
export class ExpenseDetailsPage {
  accountId: string;
  expenseId: string;
  expenseName: string;
  savingExpense: Promise<HTMLIonLoadingElement>;
  loading: Promise<HTMLIonLoadingElement>;
  deleting: Promise<HTMLIonLoadingElement>;
  currentRoute: string = this.router.url;
  expenseCost: string;
  expenseCreated: string;
  expenseCategory: string;
  expenseCreatedBy: Account;
  expenseReport: Report;
  deadData = [0, 1, 2, 3, 4, 5, 6, 7, 8]; //skeleton
  data: boolean;
  backRoute: string;

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    public inAppBrowser: InAppBrowser,
    public expenseService: ExpenseService,
    public alertCtrl: AlertController,
    public alertService: AlertService,
    public accountService: AccountService,
    public routerOutlet: IonRouterOutlet,
    public modalCtrl: ModalController,
    private location: Location
  ) {}

  async ionViewWillEnter() {
    this.loading = this.alertService.presentLoading("Student Expenses");
    (await this.loading).present();
    this.data = false;
    this.accountId = this.accountService.accountValue.id;
    this.expenseId = this.route.snapshot.paramMap.get("expenseId");

    // get id out of the url
    if (this.accountService.accountValue.role != "Admin") {
      // need better logic for this
    }

    (this.expenseService.getById(this.expenseId))
      .forEach(async (Element) => {
        //console.log(Element);
        //TODO just makes this converge into one expense object
        this.expenseName = Element.expenseName;
        this.expenseCost = Element.expenseCost;
        //TODO fix these to be singular returns
        this.expenseCreatedBy = Element.expenseStudent;
        this.expenseReport = Element.expenseReport;
        this.expenseCategory = Element.expenseCategory;
        this.expenseCreated = moment(Element.created).format(
          "MMM-DD-YYYY @HH:mm"
        );
      })
      .finally(async () => {
        this.data = true;
        setTimeout(async () => {
          (await this.loading).dismiss();
        }, 100);
      });
  }

  async editExpense(contextParamValue: string) {
    let popUpText: string;
    let currentValue: string | boolean;

    let foodChecked: boolean = false;
    let hotelChecked: boolean = false;
    let entertainmentChecked: boolean = false;
    let otherChecked: boolean = false;
    switch (contextParamValue) {
      case "expenseName": {
        popUpText = "Name";
        currentValue = this.expenseName;
        break;
      }
      case "expenseCost": {
        popUpText = "Cost";
        currentValue = this.expenseCost;
        break;
      }
      case "expenseCategory": {
        popUpText = "Category";
        switch (this.expenseCategory) {
          case "Food": {
            foodChecked = true;
            break;
          }
          case "Hotel": {
            hotelChecked = true;
            break;
          }
          case "Entertainment": {
            entertainmentChecked = true;
            break;
          }
          case "Other": {
            otherChecked = true;
            break;
          }
        }
        break;
      }
    }

    if (contextParamValue == "expenseCategory") {
      const alert = await this.alertCtrl.create({
        header: `Change Expense Category?`,
        buttons: [
          "Cancel",
          {
            text: "Ok",
            handler: async (data: any) => {
              // console.log(data);

              const categoryJsonObj = JSON.parse(
                `{"expenseCategory":"${data}"}`
              );
              this.savingExpense = this.alertService.presentLoading(
                "Saving Expense..."
              );
              (await this.savingExpense).present();
              await this.updateExpenseMasterList(categoryJsonObj, popUpText);
            },
          },
        ],
        inputs: [
          {
            type: "radio",
            label: `Food`,
            name: "expenseCategory",
            value: "Food",
            checked: foodChecked,
          },
          {
            type: "radio",
            label: `Hotel`,
            name: "expenseCategory",
            value: "Hotel",
            checked: hotelChecked,
          },
          {
            type: "radio",
            label: `Entertainment`,
            name: "expenseCategory",
            value: "Entertainment",
            checked: entertainmentChecked,
          },
          {
            type: "radio",
            label: `Other`,
            name: "expenseCategory",
            value: "Other",
            checked: otherChecked,
          },
        ],
      });
      await alert.present();
    } else {
      const alert = await this.alertCtrl.create({
        header: `Change ${popUpText}`,
        buttons: [
          "Cancel",
          {
            text: "Ok",
            handler: async (data: any) => {
              // Check for valid currency input
              if (data.expenseCost) {
                const regex = /^\d+(?:\.\d{0,2})$/;
                const numStr = `${data.expenseCost}`;

                if (!regex.test(numStr)) {
                  this.alertService.createToastAlert(
                    "Update To Expense Failed, Cost Is Invalid.....!",
                    "danger",
                    4000
                  );
                  setTimeout(async () => {
                    (await this.savingExpense).dismiss();
                  }, 100);
                  return;
                }
              }
              this.savingExpense = this.alertService.presentLoading(
                "Saving Expense..."
              );
              (await this.savingExpense).present();
              this.updateExpenseMasterList(data, popUpText);
            },
          },
        ],
        inputs: [
          {
            type: "text",
            name: contextParamValue,
            value: currentValue,
            placeholder: "us",
          },
        ],
      });
      await alert.present();
    }
  }

  private async updateExpenseMasterList(
    contextParamValue: any,
    popUpText: string
  ) {
    (this.expenseService.update(this.expenseId, contextParamValue))
      .pipe(first())
      .subscribe({
        next: async () => {
          (await this.savingExpense).dismiss();
          this.alertService.createToastAlert(
            `Update To Expense ${popUpText} Successful! `,
            "success",
            8000
          );
          this.ionViewWillEnter();
        },
        error: async (error) => {
          (await this.savingExpense).dismiss();
          this.alertService.createToastAlert(
            `Update To Expense ${popUpText} Failed...`,
            "warning",
            8000
          );
        },
      });
  }

  async deleteAreYouSure() {
    const alert = await this.alertCtrl.create({
      header: "Delete expense",
      message:
        "Are you sure you want to DELETE this expense??  This action cannot be reversed.",
      buttons: [
        {
          text: "Cancel",
          handler: () => {},
        },
        {
          text: "DELETE",
          handler: async () => {
            this.deleting = this.alertService.presentLoading(
              "Deleting Expense..."
            );
            await this.deleteExpense();
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteExpense() {
    (await this.deleting).present();
    (this.expenseService.delete(this.expenseId)).pipe(first()).subscribe({
      next: async () => {
        (await this.deleting).dismiss();
        this.alertService.createToastAlert(
          "Expense Deleted Successfully!",
          "success",
          8000
        );
        this.location.back();
        //this.router.navigateByUrl(this.backRoute);
      },
      error: async (error) => {
        (await this.deleting).dismiss();
        this.alertService.createToastAlert(
          "Expense Delete failed.....!",
          "danger",
          8000
        );
      },
    });
  }
}
