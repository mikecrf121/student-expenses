import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { StudentDetailsPage } from "./student-details";
import { StudentDetailsPageRoutingModule } from "./student-details-routing.module";
import { IonicModule } from "@ionic/angular";

@NgModule({
  imports: [CommonModule, IonicModule, StudentDetailsPageRoutingModule],
  declarations: [StudentDetailsPage],
})
export class StudentDetailsModule {}
