import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";

import { HomePage } from "./home";
import { HomePopoverPage } from "./home-popover/home-popover";
import { HomePageRoutingModule } from "./home-routing.module";

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, HomePageRoutingModule],
  declarations: [HomePage, HomePopoverPage],
  entryComponents: [HomePopoverPage],
  bootstrap: [HomePage],
})
export class HomePageModule {}
