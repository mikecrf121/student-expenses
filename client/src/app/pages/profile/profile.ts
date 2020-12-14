import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AlertController } from "@ionic/angular";
import { first } from "rxjs/operators";
import { LoadingController } from "@ionic/angular";
import * as moment from "moment";

import { UserData } from "@app/_providers";
import { AccountService, AlertService } from "@app/_services";

@Component({
  selector: "page-account",
  templateUrl: "profile.html",
  styleUrls: ["./profile.scss"],
})
export class ProfilePage {
  // Get currently logged in accounts values
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
  accountID: string;
  data: boolean;
  loading: Promise<HTMLIonLoadingElement>;
  savingAccount: Promise<HTMLIonLoadingElement>;
  loggingOut: Promise<HTMLIonLoadingElement>;
  created: any;

  constructor(
    public alertCtrl: AlertController,
    public router: Router,
    public userData: UserData,
    public accountService: AccountService,
    public alertService: AlertService,
    public loadingController: LoadingController
  ) {}

  async ionViewWillEnter() {
    this.data = false;
    this.loading = this.alertService.presentLoading("Student Expenses");
    (await this.loading)
      .present()
      .then(async () => {
        this.accountID = this.accountService.accountValue.id;
        this.title = this.accountService.accountValue.title;
        this.firstName = this.accountService.accountValue.firstName;
        this.lastName = this.accountService.accountValue.lastName;
        this.email = this.accountService.accountValue.email;
        this.role = this.accountService.accountValue.role;
        this.created = moment(this.accountService.accountValue.created).format(
          "MMMM-DD-YYYY"
        );
      })
      .finally(async () => {
        setTimeout(async () => {
          this.data = true;
          (await this.loading).dismiss();
        }, 300);
      });
  }

  async ionViewDidlEnter() {}

  // TODO with images later
  updatePicture() {
    console.log("Clicked to update picture");
  }

  async changeUsername() {}

  async getUsername() {
    /* this.userData.getUsername().then((username) => {
      this.username = username;
    });*/
  }

  async changePassword() {
    const alert = await this.alertCtrl.create({
      header: "Change Password",
      buttons: [
        "Cancel",
        {
          text: "Ok",
          handler: async (data: any) => {
            //console.log(data);
            this.savingAccount = this.alertService.presentLoading("Saving...");
            (await this.savingAccount).present();
            this.updateAccountPassword(data);
          },
        },
      ],
      inputs: [
        {
          type: "text",
          name: "password",
          placeholder: "New Password",
        },
      ],
    });
    await alert.present();
  }

  async logout() {
    this.loggingOut = this.alertService.presentLoading("Logging Out..");
    (await this.loggingOut)
      .present()
      .then(async () => {
        await this.userData.logout();
      })
      .finally(async () => {
        setTimeout(async () => {
          (await this.loggingOut).dismiss();
        }, 300);
      });
  }

  async support() {
    this.router.navigateByUrl("/support");
  }

  private async updateAccountPassword(contextParamValue: string) {
    (await this.accountService.update(this.accountID, contextParamValue))
      .pipe(first())
      .subscribe({
        next: async () => {
          (await this.savingAccount).dismiss();
          this.alertService.createToastAlert(
            "Update to Password Successful",
            "success",
            6000
          );
          // might not need to do this actually....
          this.ionViewWillEnter();
        },
        error: async (error) => {
          (await this.savingAccount).dismiss();
          this.alertService.createToastAlert(
            "Update to Property Master List Failed...",
            "warning",
            6000
          );
        },
      });
  }

  async deleteAccount() {
    this.alertService.createToastAlert(
      "Currently ONLY Admins Can Delete Accounts",
      "warning",
      8000
    );
  }
}
