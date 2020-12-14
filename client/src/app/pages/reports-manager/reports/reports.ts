import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Config, IonRouterOutlet, ModalController } from "@ionic/angular";
import * as moment from "moment";
import { ReportsFilterPage } from "./reports-filter/reports-filter";

import { Report } from "@app/_models";
import { AccountService, AlertService } from "@app/_services";

@Component({
  selector: "page-reports-list",
  templateUrl: "reports.html",
  styleUrls: ["./reports.scss"],
})
export class ReportsListPage {
  queryText: string = "";
  showSearchbar: boolean;
  ios: boolean;
  reportsList: [Report] | any; //TODO fix this
  reportsManagerId: string;
  loading: Promise<HTMLIonLoadingElement>;
  currentRoute: string = this.router.url;
  deadData = [0, 1, 2, 3, 4, 5, 6, 7, 8]; //skeleton
  data: boolean;
  backButtonDisabled: boolean;
  activeCondition: string | boolean;
  isActive: boolean | string;
  filtersList: { isActive: string | boolean };

  constructor(
    private accountService: AccountService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router,
    public routerOutlet: IonRouterOutlet,
    public modalCtrl: ModalController,
    public config: Config
  ) {}

  async ionViewWillEnter() {
    this.loading = this.alertService.presentLoading("Student Expenses");
    (await this.loading).present();
    this.ios = (await this.config.get("mode")) === "ios";
    this.data = false;
    this.currentRoute.split("/")[1] == "reports-manager"
      ? (this.backButtonDisabled = true)
      : (this.backButtonDisabled = false);
    this.isActive = "Active";
    this.updateView();
    this.reportsManagerId = this.accountService.accountValue.id;
    if (this.accountService.accountValue.role == "Admin") {
      this.reportsManagerId = this.route.snapshot.paramMap.get("accountId");
      // If your an admin the account Id will be inside the url, removed for none admin views
      if (this.route.snapshot.paramMap.get("accountId") == null) {
        this.reportsManagerId = this.accountService.accountValue.id;
      }
    }
    (await this.accountService.getAllReportsOnAccount(this.reportsManagerId))
      .forEach(async (Element) => {
        //console.log(Element);
        this.reportsList = Element;
      })
      .then(async () => {
        const reportsCount = this.reportsList.length;
        for (let i = 0; i < reportsCount; i++) {
          this.reportsList[i].created = moment(
            this.reportsList[i].created
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
