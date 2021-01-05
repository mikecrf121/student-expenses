import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Config, IonRouterOutlet, ModalController } from "@ionic/angular";
import * as moment from "moment";
import { StudentsFilterPage } from "./students-filter/students-filter";

import { Account } from "@app/_models";
import { AccountService, AlertService } from "@app/_services";

@Component({
  selector: "page-students-list",
  templateUrl: "students.html",
  styleUrls: ["./students.scss"],
})
export class StudentsListPage {
  studentsList: [Account] | undefined | Account | any;
  userId: string;
  loading: Promise<HTMLIonLoadingElement>;
  currentRoute: string = this.router.url;
  queryText: string = "";
  showSearchbar: boolean;
  ios: boolean;
  deadData = [0, 1, 2, 3, 4, 5, 6, 7, 8]; //skeleton
  data: boolean;
  backButtonDisabled: boolean;
  isOnline: string;
  onOffCondition: boolean;
  filtersList: { isOnline: string | boolean };

  constructor(
    private account: AccountService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router,
    public modalCtrl: ModalController,
    public routerOutlet: IonRouterOutlet,
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
    this.isOnline = "undefined";
    this.onOffCondition = undefined;
    // TODO-Should probably make the bellow check a reusable componenet some how
    this.userId = this.account.accountValue.id;
    if (this.account.accountValue.role == "Admin") {
      this.userId = this.route.snapshot.paramMap.get("accountId");
      if (this.route.snapshot.paramMap.get("accountId") == null) {
        this.userId = this.account.accountValue.id;
      }
    }
    // Get all of this.userId's students <-----who is a reports managers so his/her userId
    (this.account.getAllStudents(this.userId))
      .forEach(async (element) => {
        this.studentsList = element;
      })
      .then(async () => {
        const studentsListLength = this.studentsList.length;
        for (let i = 0; i < studentsListLength; i++) {
          this.studentsList[i].lastLogin
            ? (this.studentsList[i].lastLogin = moment(
                this.studentsList[i].lastLogin
              ).format("MMM-DD @HH:mm"))
            : "";
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

  async ionViewDidEnter() {}

  // Updates main view from filter...very cool
  async updateView() {
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
      isOnline: this.isOnline,
    };

    const modal = await this.modalCtrl.create({
      component: StudentsFilterPage,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: { filtersList: this.filtersList },
    });
    modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.isOnline = await data.isOnline;
      this.updateView();
    }
  }
}
