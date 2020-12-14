import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  AlertController,
  Config,
  IonRouterOutlet,
  LoadingController,
  ModalController,
  ToastController,
} from "@ionic/angular";
import * as moment from "moment";
import { ExpensesFilterPage } from "./expenses-filter/expenses-filter";

import { UserData } from "@app/_providers";
import { Expense } from "@app/_models";
import { AccountService, AlertService } from "@app/_services";

@Component({
  selector: "page-expenses-list",
  templateUrl: "expenses.html",
  styleUrls: ["./expenses.scss"],
})
export class ExpensesListPage {
  queryText: string = "";
  showSearchbar: boolean;
  ios: boolean;
  reportsManagerId: string;
  expensesList: [Expense];
  loading: Promise<HTMLIonLoadingElement>;
  currentRoute: string = this.router.url;
  userId: string;
  reportsExpenses: any;
  expensesTotal: number;
  expensesCount: number;
  foodIsChecked: boolean;
  hotelIsChecked: boolean;
  entertainmentIsChecked: boolean;
  otherIsChecked: boolean;
  foodCondition: string = "";
  hotelCondition: string = "";
  entertainmentCondition: string = "";
  otherCondition: string = "";
  deadData = [0, 1, 2, 3, 4, 5, 6, 7, 8]; //skeleton
  data: boolean;
  backRoute: string;
  backButtonDisabled: boolean;
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
    private accountService: AccountService,
    private route: ActivatedRoute
  ) {}

  async ionViewWillEnter() {
    //This loader and resets should always go first
    this.loading = this.alertService.presentLoading("Student Expenses");
    (await this.loading).present();
    this.ios = (await this.config.get("mode")) === "ios";
    this.data = false;
    this.currentRoute.split("/")[1] == "reports-manager"
      ? (this.backButtonDisabled = true)
      : (this.backButtonDisabled = false);
    //Reset filters
    this.foodIsChecked = true;
    this.hotelIsChecked = true;
    this.entertainmentIsChecked = true;
    this.otherIsChecked = true;
    // Not always though when admin
    this.reportsManagerId = this.accountService.accountValue.id;
    // Incase Admins Are Viewing another reports manager expenses list As Them
    if (this.accountService.accountValue.role == "Admin") {
      this.reportsManagerId = this.route.snapshot.paramMap.get("accountId");
      if (this.route.snapshot.paramMap.get("accountId") == null) {
        this.reportsManagerId = this.accountService.accountValue.id;
      }
    }
    this.userId = this.accountService.accountValue.id;
    if (this.accountService.accountValue.role == "Admin") {
      this.userId = this.route.snapshot.paramMap.get("accountId");
      if (this.route.snapshot.paramMap.get("accountId") == null) {
        this.userId = this.accountService.accountValue.id;
      }
    }
    // According to simple test this foreach on the observable is just as fast then below subscribe???
    //const dateNOW = Date.now();
    (await this.accountService.getAllExpensesInReports(this.userId))
      .forEach(async (element) => {
        this.reportsExpenses = element;
      })
      .then(async () => {
        //console.log(Date.now()- dateNOW)
        this.expensesCount = this.reportsExpenses.length;
      })
      .then(async () => {
        for (let i = 0; i < this.expensesCount; i++) {
          this.reportsExpenses[i].created = moment(
            this.reportsExpenses[i].created
          ).format("MMM-DD-YYYY");
        }
      })
      .finally(async () => {
        // Might seem like a smoother transition doing this?
        this.data = true;
        setTimeout(async () => {
          (await this.loading).dismiss();
        }, 100);
      });

    //this operation is taking 300-350 ms average
    /*const dateNOW = Date.now();
      (await this.accountService.getAllExpensesInReports(this.userId))
      .subscribe(async (emitedData)=>{
        setTimeout(()=>{
          console.log(Date.now()- dateNOW)
          console.log('emitted data??',emitedData)
          //console.log(Date.now()- dateNOW)
        },0)
      });*/
  }

  async ionViewDidlEnter() {}

  async ionViewDidLeave() {
    this.expensesTotal = 0;
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
