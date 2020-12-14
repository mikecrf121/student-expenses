import { Component } from "@angular/core";
import { Config, PopoverController } from "@ionic/angular";
import { HomePopoverPage } from "./home-popover/home-popover";

import { AccountService, AlertService } from "@app/_services";

@Component({
  selector: "page-home",
  templateUrl: "home.html",
  styleUrls: ["./home.scss"],
})
export class HomePage {
  // All the logged in users account information!!!
  account = this.accountService.accountValue;
  location = "chicago";
  conferenceDate = "2047-05-17";

  selectOptions = {
    header: "Select a Location",
  };
  loading: Promise<HTMLIonLoadingElement>;
  ios: boolean;

  constructor(
    public popoverCtrl: PopoverController,
    private accountService: AccountService,
    public alertService: AlertService,
    public config: Config
  ) {
    this.loading = this.alertService.presentLoading("Student Expenses");
  }

  async presentPopover(event: Event) {
    const popover = await this.popoverCtrl.create({
      component: HomePopoverPage,
      event,
    });
    await popover.present();
  }

  async ionViewWillEnter() {
    this.ios = this.config.get("mode") === "ios";
    (await this.loading).present();
  }
  async ionViewDidEnter() {
    (await this.loading).dismiss();
  }
}
