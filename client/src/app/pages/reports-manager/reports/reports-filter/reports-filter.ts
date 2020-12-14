import { Component } from "@angular/core";
import { Config, ModalController, NavParams } from "@ionic/angular";

@Component({
  selector: "page-reports-filter",
  templateUrl: "reports-filter.html",
  styleUrls: ["./reports-filter.scss"],
})
export class ReportsFilterPage{
  ios: boolean;

  isActive: string;
  filtersList: { isActive: string; };

  constructor(
    private config: Config,
    public modalCtrl: ModalController,
    public navParams: NavParams
  ) {}



  async ionViewWillEnter() {
    this.ios = this.config.get("mode") === `ios`;
    const filtersListComingIn = this.navParams.get("filtersList");
    //console.log(filtersListComingIn,'coming in')
    this.isActive = filtersListComingIn.isActive;
  }

  async selectAll() {
    this.isActive = 'Active';
  }

  async applyFilters() {
    // Pass back a new array of track names to exclude
    this.filtersList = {
      isActive: this.isActive,
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
