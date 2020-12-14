import { Injectable } from "@angular/core";
import { AccountService, AlertService } from "@app/_services";
import { Storage } from "@ionic/storage";

@Injectable({
  providedIn: "root",
})
export class UserData {
  favorites: string[] = [];
  HAS_LOGGED_IN = "hasLoggedIn";
  IS_DARK_MODE = "darkModeActivated";

  constructor(
    public storage: Storage,
    public account: AccountService,
    private toastAlert: AlertService
  ) {}

  async login(email: string): Promise<any> {
    await this.storage.set(this.HAS_LOGGED_IN, true);
    //console.log(email,"???huh")
    await this.setUsername(email);
    return window.dispatchEvent(new CustomEvent("user:login"));
  }

  async signup(email: string): Promise<any> {
    async () => {
      await this.setUsername(email);
      return;
    };
  }

  // For setting and retrieving dark mode setting... very cool
  // TODO save setting to cloud profile
  async setDarkMode(onOff: boolean): Promise<any> {
    const userName = await this.getUsername();
    await this.storage.set(`${this.IS_DARK_MODE}-${userName}`, onOff);
  }

  async isDarkMode(): Promise<boolean> {
    const userName = await this.getUsername();
    return await this.storage
      .get(`${this.IS_DARK_MODE}-${userName}`)
      .then(async (value) => {
        return (await value) === true;
      });
  }

  async logout(): Promise<any> {
    await this.storage.remove(this.HAS_LOGGED_IN);
    this.account.logout();
    await this.storage.remove("email");
    window.dispatchEvent(new CustomEvent("user:logout"));
    //location.reload();
    return this.toastAlert.createToastAlert(
      "Logout Successful",
      "primary",
      4000
    );
  }

  async setUsername(email: string): Promise<any> {
    return await this.storage.set("email", email);
  }

  async getUsername(): Promise<string> {
    return await this.storage.get("email").then(async (value) => {
      return value;
    });
  }

  async isLoggedIn(): Promise<boolean> {
    return await this.storage.get(this.HAS_LOGGED_IN).then(async (value) => {
      return (await value) === true;
    });
  }
}
