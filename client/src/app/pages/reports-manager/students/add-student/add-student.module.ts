import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";

import { AddStudentPage } from "./add-student";
import { AddStudentPageRoutingModule } from "./add-student-routing.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddStudentPageRoutingModule,
  ],
  declarations: [AddStudentPage],
})
export class AddStudentModule {}
