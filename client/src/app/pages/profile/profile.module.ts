import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";

import { ProfilePage } from "./profile";
import { ProfilePageRoutingModule } from "./profile-routing.module";

@NgModule({
  imports: [CommonModule, IonicModule, ProfilePageRoutingModule],
  declarations: [ProfilePage],
})
export class ProfileModule {}
