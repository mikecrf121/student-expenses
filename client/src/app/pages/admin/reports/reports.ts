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
import * as moment from "moment";
import { ReportsFilterPage } from "./reports-filter/reports-filter";

import { AlertService, ReportService } from "@app/_services";
import { Report } from "@app/_models";
import { UserData } from "@app/_providers";

@Component({
  selector: "page-admin-reports",
  templateUrl: "reports.html",
  styleUrls: ["./reports.scss"],
})
export class ReportsPage {
  // Gets a reference to the list element
  // may use later
  @ViewChild("allAccountsList", { static: true }) allAccountsList: IonList;

  ios: boolean;
  queryText: string = "";
  segment = "all";
  showSearchbar: boolean;
  allReports: any | [Report];
  adminsIsChecked: boolean;
  ReportManagersIsChecked: boolean;

  deadData = [0, 1, 2, 3, 4, 5, 6, 7, 8]; //skeleton

  adminCondition: string = "";
  ReportManagerCondition: string = "";
  currentRoute: string = this.router.url;
  data: boolean;
  loading: Promise<HTMLIonLoadingElement>;
  isActive: string;
  activeCondition: string;
  filtersList: { isActive: string };

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
    private reportService: ReportService
  ) {}

  async ionViewWillEnter() {
    this.loading = this.alertService.presentLoading("Admin Student Expenses");
    this.data = false;
    this.isActive = "Active";
    this.updateView();
    (await this.loading)
      .present()
      .then(async () => {
        this.adminsIsChecked = true;
        this.ReportManagersIsChecked = true;
        this.ios = (await this.config.get("mode")) === "ios";
      })
      .then(async () => {
        (this.reportService.getAll())
          .forEach(async (Element) => {
            //console.log(Element);
            this.allReports = Element;
          })
          .then(async () => {
            const reportsCount = this.allReports.length;
            for (let i = 0; i < reportsCount; i++) {
              this.allReports[i].reportStudentsCount = this.allReports[
                i
              ].reportStudentsList.length;
              this.allReports[i].created = moment(
                this.allReports[i].created
              ).format("MMM-DD-YYYY");
            }
          });
      })
      .finally(async () => {
        // Might seem like a smoother transition doing this?
        this.data = true;
        setTimeout(async () => {
          (await this.loading).dismiss();
        }, 100);
      });
  }

  // For Filter

  // Updates main view from filter...very cool
  async updateView() {
    // Online / Offline Check
    this.isActive == "Archived"
      ? (this.activeCondition = "Active")
      : this.isActive == "Active"
      ? (this.activeCondition = "Archived")
      : (this.activeCondition = undefined);

    //this.onOffCondition = this.isOnline;
  }

  async presentFilter() {
    this.filtersList = {
      isActive: this.isActive,
    };
    const modal = await this.modalCtrl.create({
      component: ReportsFilterPage,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: { filtersList: this.filtersList },
    });
    modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.isActive = await data.isActive;
      this.updateView();
    }
  }
}
