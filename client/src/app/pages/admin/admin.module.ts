import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";

import { Admin } from "./admin";
import { AdminRoutingModule } from "./admin-routing.module";

@NgModule({
  imports: [CommonModule, IonicModule, AdminRoutingModule],
  declarations: [Admin],
})
export class AdminModule {}
