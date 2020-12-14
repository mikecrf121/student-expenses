import { Component } from "@angular/core";
import { ActionSheetController } from "@ionic/angular";
import { ActivatedRoute } from "@angular/router";

import { Photo, PhotoService } from "@app/_services";

@Component({
  selector: "expense-image",
  templateUrl: "expense-image.html",
  styleUrls: ["expense-image.scss"],
})
export class ExpenseImagePage {
  expenseId: string;

  constructor(
    public photoService: PhotoService,
    public actionShexpenseController: ActionSheetController,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.expenseId = this.route.snapshot.paramMap.get("expenseId");
    await this.photoService.loadSaved(this.expenseId);
    console.log(this.expenseId);
  }

  public async showActionSheet(photo: Photo, position: number) {
    const actionShexpense = await this.actionShexpenseController.create({
      header: "Photos",
      buttons: [
        {
          text: "Delete Picture",
          role: "destructive",
          icon: "trash",
          handler: () => {
            this.photoService.deletePicture(photo, position, this.expenseId);
          },
        },
        {
          text: "Cancel",
          icon: "close",
          role: "cancel",
          handler: () => {
            // Nothing to do, action shexpense is automatically closed
          },
        },
      ],
    });
    await actionShexpense.present();
  }
}
