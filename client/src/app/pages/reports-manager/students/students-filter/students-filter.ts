import { Component } from "@angular/core";
import { Config, ModalController, NavParams } from "@ionic/angular";

@Component({
  selector: "page-students-filter",
  templateUrl: "students-filter.html",
  styleUrls: ["./students-filter.scss"],
})
export class StudentsFilterPage {
  ios: boolean;


  isOnline: string;
  filtersList: {
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
    this.isOnline = filtersListComingIn.isOnline;
  }

  async selectAll() {
    this.isOnline = "undefined";
  }

  async applyFilters() {
    // Pass back a new array of track names to exclude
    this.filtersList = {
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
