import { Component, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import {
  AlertController,
  IonList,
  IonRouterOutlet,
  LoadingController,
  ModalController,
  ToastController,
  Config,
} from "@ionic/angular";
import { AccountsFilterPage } from "./accounts-filter/accounts-filter";
import * as moment from "moment";

import { AccountService, AlertService } from "@app/_services";
import { Account } from "@app/_models";

@Component({
  selector: "page-admin-accounts",
  templateUrl: "accounts.html",
  styleUrls: ["./accounts.scss"],
})
export class AccountsPage {
  // Gets a reference to the list element
  @ViewChild("allAccountsList", { static: true }) allAccountsList: IonList;

  ios: boolean;
  queryText: string = "";
  segment = "all"; // used for base app
  showSearchbar: boolean;
  allAccounts: any | [Account];
  adminsIsChecked: boolean;
  studentsIsChecked: boolean;
  reportsManagersIsChecked: boolean;
  deadData = [0, 1, 2, 3, 4, 5, 6, 7, 8]; //skeleton

  adminCondition: string = "";
  studentCondition: string = "";
  reportsManagerCondition: string = "";
  data: boolean;
  isOnline: boolean | string;
  onOffCondition: string | boolean;
  loading: Promise<HTMLIonLoadingElement>;
  filtersList: {
    adminsIsChecked: boolean;
    studentsIsChecked: boolean;
    reportsManagersIsChecked: boolean;
    isOnline: string | boolean;
  };

  constructor(
    public alertCtrl: AlertController,
    private alertService: AlertService,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public router: Router,
    public routerOutlet: IonRouterOutlet,
    public toastCtrl: ToastController,
    public config: Config,
    private accountService: AccountService
  ) {}

  async ionViewDidEnter() {}

  async ionViewWillEnter() {
    // This is faster I think? but using the later to visualize data.
    // but maybe not since the service already pipes it
    /* (await this.accountService.getAll())
      .pipe(first())
      .subscribe((accounts) => (this.allAccounts = accounts));
    */
    this.loading = this.alertService.presentLoading("Admin Student Expenses");
    this.data = false;
    (await this.loading)
      .present()
      .then(async () => {
        this.adminsIsChecked = true;
        this.studentsIsChecked = true;
        this.reportsManagersIsChecked = true;
        this.isOnline = "undefined";
        this.onOffCondition = undefined;
        this.ios = this.config.get("mode") === "ios";
      })
      .then(async () => {
        await (await this.accountService.getAll()).forEach(async (Element) => {
          this.allAccounts = Element;
          //console.log(this.allAccounts, "right here");
        });
      })
      .then(async () => {
        const accountsCount = this.allAccounts.length;
        for (let i = 0; i < accountsCount; i++) {
          this.allAccounts[i].lastLogin
            ? (this.allAccounts[i].lastLogin = moment(
                this.allAccounts[i].lastLogin
              ).format("MMM-DD @HH:mm"))
            : "";
          this.allAccounts[i].created = moment(
            this.allAccounts[i].created
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
  }

  // Updates main view from filter...very cool
  async updateView() {
    this.adminsIsChecked
      ? (this.adminCondition = "")
      : (this.adminCondition = "Admin");
    this.studentsIsChecked
      ? (this.studentCondition = "")
      : (this.studentCondition = "Student");
    this.reportsManagersIsChecked
      ? (this.reportsManagerCondition = "")
      : (this.reportsManagerCondition = "ReportsManager");
    // Online / Offline Check
    this.isOnline == "true"
      ? (this.onOffCondition = false)
      : this.isOnline == "false"
      ? (this.onOffCondition = true)
      : (this.onOffCondition = undefined);

    //this.onOffCondition = this.isOnline;
  }

  async presentFilter() {
    this.filtersList = {
      adminsIsChecked: this.adminsIsChecked,
      studentsIsChecked: this.studentsIsChecked,
      reportsManagersIsChecked: this.reportsManagersIsChecked,
      isOnline: this.isOnline,
    };

    const modal = await this.modalCtrl.create({
      component: AccountsFilterPage,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: { filtersList: this.filtersList },
    });
    modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.adminsIsChecked = await data.adminsIsChecked;
      this.studentsIsChecked = await data.studentsIsChecked;
      this.reportsManagersIsChecked = await data.reportsManagersIsChecked;
      this.isOnline = await data.isOnline;
      this.updateView();
    }
  }
}
