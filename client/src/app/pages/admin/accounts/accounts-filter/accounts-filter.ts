import { Component } from "@angular/core";
import { Config, ModalController, NavParams } from "@ionic/angular";

@Component({
  selector: "page-accounts-filter",
  templateUrl: "accounts-filter.html",
  styleUrls: ["./accounts-filter.scss"],
})
export class AccountsFilterPage {
  ios: boolean;

  //adminsIsChecked: boolean=true;
  adminsIsChecked: boolean;
  studentsIsChecked: boolean;
  reportsManagersIsChecked: boolean;

  isOnline: string;
  filtersList: {
    adminsIsChecked: boolean;
    studentsIsChecked: boolean;
    reportsManagersIsChecked: boolean;
    isOnline: string;
  };

  constructor(
    private config: Config,
    public modalCtrl: ModalController,
    public navParams: NavParams
  ) {}

  async ionViewWillEnter() {
    this.ios = this.config.get("mode") === `ios`;
    const filtersListComingIn = this.navParams.get("filtersList");
    this.adminsIsChecked = filtersListComingIn.adminsIsChecked;
    this.studentsIsChecked = filtersListComingIn.studentsIsChecked;
    this.reportsManagersIsChecked =
      filtersListComingIn.reportsManagersIsChecked;
    this.isOnline = filtersListComingIn.isOnline;
  }

  async selectAll() {
    this.adminsIsChecked = true;
    this.studentsIsChecked = true;
    this.reportsManagersIsChecked = true;
    this.isOnline = "undefined";
  }

  async deSelectAll() {
    this.adminsIsChecked = false;
    this.studentsIsChecked = false;
    this.reportsManagersIsChecked = false;
    this.isOnline = "undefined";
  }

  async applyFilters() {
    // Pass back a new array of track names to exclude
    this.filtersList = {
      adminsIsChecked: this.adminsIsChecked,
      studentsIsChecked: this.studentsIsChecked,
      reportsManagersIsChecked: this.reportsManagersIsChecked,
      isOnline: this.isOnline,
    };
    this.dismiss(this.filtersList);
  }

  async dismiss(data?: any) {
    // using the injected ModalController this page
    // can "dismiss" itself and pass back data
    //console.log("filters list after done with modal",data)
    this.modalCtrl.dismiss(data);
  }
}
