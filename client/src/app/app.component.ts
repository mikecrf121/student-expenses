import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { SwUpdate } from "@angular/service-worker";
import { Config, Platform, ToastController } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
//import { Storage } from "@ionic/storage";

import { UserData } from "@app/_providers";
import { AccountService, AlertService } from "@app/_services";
import { Account, Role } from "@app/_models";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  Role = Role;
  // should move this observable to login possibly
  account: Account;
  ios: boolean;

  appAdminPages = [
    {
      title: "Accounts",
      url: "/admin/accounts",
      icon: "people",
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: "documents",
    },
    {
      title: "Expenses",
      url: "/admin/expenses",
      icon: "cash",
    },
  ];

  appReportsManagerPages = [
    {
      title: "Reports",
      url: "/reports-manager/reports",
      icon: "documents",
    },
    {
      title: "Students",
      url: "/reports-manager/students",
      icon: "people",
    },
    {
      title: "Expenses",
      url: "/reports-manager/reports-expenses",
      icon: "cash",
    },
  ];

  loggedIn = false;
  dark = false;
  loading: Promise<HTMLIonLoadingElement>;
  loggingOut: Promise<HTMLIonLoadingElement>;
  data: boolean;

  constructor(
    private accountService: AccountService,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    //private storage: Storage,
    private userData: UserData,
    private swUpdate: SwUpdate,
    private toastCtrl: ToastController,
    private alertService: AlertService,
    public config: Config
  ) {
    /// Think I should move this to On Login....
    this.accountService.account.subscribe((x) => (this.account = x));
    this.initializeApp();
  }

  async ionViewDidEnter() {
  }

  async ionViewWillEnter() {
    this.checkDarkMode();
    this.ios = (await this.config.get("mode")) === "ios";
  }

  async ngOnInit() {
    this.checkDarkMode();
    this.ios = (await this.config.get("mode")) === "ios";
    this.splashScreen.show();
    await this.checkLoginStatus();
    await this.listenForLoginEvents();
    // Used if I ever did an update service...
    this.swUpdate.available.subscribe(async (res) => {
      const toast = await this.toastCtrl.create({
        message: "Update available!",
        position: "bottom",
        buttons: [
          {
            role: "cancel",
            text: "Reload",
          },
        ],
      });
      await toast.present();
      await toast
        .onDidDismiss()
        .then(async () => await this.swUpdate.activateUpdate())
        .then(async () => window.location.reload());
    });
  }

  async initializeApp() {
    this.loading = this.alertService.presentLoading("Student Expenses");
    (await this.loading).present();
    await this.platform
      .ready()
      .then(async () => {
        this.statusBar.styleDefault();
        this.splashScreen.hide();
      })
      .finally(async () => {
        (await this.loading).dismiss();
        this.splashScreen.hide();
      });
  }

  // Saving dark mode setting to storage
  async saveDarkModeChange(dark: boolean) {
    const darkMode = await this.userData.setDarkMode(dark);
  }

  async checkDarkMode() {
    const darkMode = await this.userData.isDarkMode();
    return this.updateDarkModeStatus(darkMode);
  }

  async updateDarkModeStatus(darkMode: boolean) {
    this.dark = darkMode;
  }

  async checkLoginStatus() {
    const loggedIn = await this.userData.isLoggedIn();
    return this.updateLoggedInStatus(loggedIn);
  }

  async updateLoggedInStatus(loggedIn: boolean) {
    this.checkDarkMode(); // I really like dark mode
    setTimeout(async () => {
      this.loggedIn = loggedIn;
    }, 300);
  }

  async listenForLoginEvents() {
    window.addEventListener("user:login", async () => {
      await this.updateLoggedInStatus(true);
    });

    window.addEventListener("user:signup", async () => {
      await this.updateLoggedInStatus(true);
    });

    window.addEventListener("user:logout", async () => {
      await this.updateLoggedInStatus(false);
    });
  }

  async logout() {
    this.loggingOut = this.alertService.presentLoading("Logging Out...");
    (await this.loggingOut).present();
    await this.userData.logout();
    (await this.loggingOut).dismiss();
  }
}
