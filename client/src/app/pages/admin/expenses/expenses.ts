import { Component } from "@angular/core";
import { Router } from "@angular/router";
import {
  AlertController,
  IonRouterOutlet,
  LoadingController,
  ModalController,
  ToastController,
  Config,
} from "@ionic/angular";
import { ExpensesFilterPage } from "./expenses-filter/expenses-filter";
import * as moment from "moment";

import { UserData } from "@app/_providers";
import { AlertService, ExpenseService } from "@app/_services";
import { Account, Expense } from "@app/_models";

@Component({
  selector: "page-expenses",
  templateUrl: "expenses.html",
  styleUrls: ["./expenses.scss"],
})
export class ExpensesPage {
  ios: boolean;
  queryText = "";
  segment = "all";
  showSearchbar: boolean;
  loading: any;
  allAccounts: any | [Account];
  allExpenses: any | [Expense];
  // Filters list items
  foodIsChecked: boolean;
  hotelIsChecked: boolean;
  entertainmentIsChecked: boolean;
  otherIsChecked: boolean;
  currentRoute: string = this.router.url;
  // Filters list items for hidden in view
  foodCondition: string = "";
  hotelCondition: string = "";
  entertainmentCondition: string = "";
  otherCondition: string = "";
  data: boolean;
  deadData = [0, 1, 2, 3, 4, 5, 6, 7, 8]; //skeleton
  filtersList: {
    foodIsChecked: boolean;
    hotelIsChecked: boolean;
    entertainmentIsChecked: boolean;
    otherIsChecked: boolean;
  };

  constructor(
    public alertCtrl: AlertController,
    private alertService: AlertService,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public router: Router,
    public routerOutlet: IonRouterOutlet,
    public toastCtrl: ToastController,
    public user: UserData,
    public config: Config,
    private expenseService: ExpenseService
  ) {}

  async ionViewWillEnter() {
    //const startTime = Date.now();
    this.loading = this.alertService.presentLoading("Admin Student Expenses");
    (await this.loading).present();
    this.ios = (await this.config.get("mode")) === "ios";
    this.data = false; //used for skeleton
    this.foodIsChecked = true;
    this.hotelIsChecked = true;
    this.entertainmentIsChecked = true;
    this.otherIsChecked = true;

    (await this.expenseService.getAll())
      .forEach(async (Element) => {
        this.allExpenses = Element;
        //console.log(this.allExpenses, "right here");
      })
      .then(async () => {
        const expensesCount = this.allExpenses.length;
        for (let i = 0; i < expensesCount; i++) {
          this.allExpenses[i].created = moment(
            this.allExpenses[i].created
          ).format("MMM-DD-YYYY @HH:mm");
        }
      })
      .finally(async () => {
        // Might seem like a smoother transition doing this?
        //console.log(Date.now()-startTime)
        this.data = true;
        setTimeout(async () => {
          (await this.loading).dismiss();
        }, 100);
      });
  }

  // Updates main view from filter...very cool
  async updateView() {
    this.foodIsChecked
      ? (this.foodCondition = "")
      : (this.foodCondition = "Food");

    this.hotelIsChecked
      ? (this.hotelCondition = "")
      : (this.hotelCondition = "Hotel");

    this.entertainmentIsChecked
      ? (this.entertainmentCondition = "")
      : (this.entertainmentCondition = "Entertainment");

    this.otherIsChecked
      ? (this.otherCondition = "")
      : (this.otherCondition = "Other");
  }

  async presentFilter() {
    this.filtersList = {
      foodIsChecked: this.foodIsChecked,
      hotelIsChecked: this.hotelIsChecked,
      entertainmentIsChecked: this.entertainmentIsChecked,
      otherIsChecked: this.otherIsChecked,
    };

    const modal = await this.modalCtrl.create({
      component: ExpensesFilterPage,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: { filtersList: this.filtersList },
    });
    modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.foodIsChecked = await data.foodIsChecked;
      this.hotelIsChecked = await data.hotelIsChecked;
      this.entertainmentIsChecked = await data.entertainmentIsChecked;
      this.otherIsChecked = await data.otherIsChecked;
      this.updateView();
    }
  }
}
