import { Component } from "@angular/core";
import { Config, ModalController, NavParams } from "@ionic/angular";

@Component({
  selector: "page-expenses-filter",
  templateUrl: "expenses-filter.html",
  styleUrls: ["./expenses-filter.scss"],
})
export class ExpensesFilterPage {
  ios: boolean;
  foodIsChecked: boolean;
  hotelIsChecked: boolean;
  entertainmentIsChecked: boolean;
  otherIsChecked: boolean;

  filtersList: any;

  constructor(
    private config: Config,
    public modalCtrl: ModalController,
    public navParams: NavParams
  ) {}

  async ionViewWillEnter() {
    this.ios = this.config.get("mode") === `ios`;

    const filtersListComingIn = this.navParams.get("filtersList");

    this.foodIsChecked = filtersListComingIn.foodIsChecked;
    this.hotelIsChecked = filtersListComingIn.hotelIsChecked;
    this.entertainmentIsChecked = filtersListComingIn.entertainmentIsChecked;
    this.otherIsChecked = filtersListComingIn.otherIsChecked;
  }

  async selectAll() {
    this.foodIsChecked = true;
    this.hotelIsChecked = true;
    this.entertainmentIsChecked = true;
    this.otherIsChecked = true;
  }

  async deSelectAll() {
    this.foodIsChecked = false;
    this.hotelIsChecked = false;
    this.entertainmentIsChecked = false;
    this.otherIsChecked = false;
  }

  async applyFilters() {
    // Pass back a new array of track names to exclude
    this.filtersList = {
      foodIsChecked: this.foodIsChecked,
      hotelIsChecked: this.hotelIsChecked,
      entertainmentIsChecked: this.entertainmentIsChecked,
      otherIsChecked: this.otherIsChecked,
    };
    this.dismiss(this.filtersList);
  }

  async dismiss(data?: any) {
    this.modalCtrl.dismiss(data);
  }
}
