import { Injectable } from "@angular/core";
import { ToastController } from "@ionic/angular";
import { LoadingController } from "@ionic/angular";

@Injectable({ providedIn: "root" })
export class AlertService {
  constructor(
    private toastCtrl: ToastController,
    private loadingController: LoadingController
  ) {}
  // Used to create toast alerts throughout app
  async createToastAlert(
    messageParam: string,
    colorParam?: "primary" | "warning" | "danger" | "success", //<--- this is cool because linter tells you these
    durationParam?: number
  ) {
    const toast = await this.toastCtrl.create({
      message: messageParam,
      position: "bottom",
      duration: durationParam,
      color: colorParam,
      buttons: [
        {
          role: "cancel",
          text: "Ok",
        },
      ],
    });
    await toast.present();
    toast.onDidDismiss();
  }
  // Used to create loaders throughout app
  async presentLoading(messageParam: string) {
    const loading = this.loadingController.create({
      message: messageParam,
    });
    return loading;
  }
}
