import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AddReportPage } from "./add-report";
import { AddReportPageRoutingModule } from "./add-report-routing.module";
import { IonicModule } from "@ionic/angular";
import { FormsModule } from "@angular/forms";

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, AddReportPageRoutingModule],
  declarations: [AddReportPage],
})
export class AddReportModule {}
