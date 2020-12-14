import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { ReportsManager } from "./reports-manager";
import { ReportsManagerRoutingModule } from "./reports-manager-routing.module";
import { FormsModule } from "@angular/forms";

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    IonicModule,
    ReportsManagerRoutingModule,
  ],
  declarations: [ReportsManager],
})
export class ReportsManagerModule {}
