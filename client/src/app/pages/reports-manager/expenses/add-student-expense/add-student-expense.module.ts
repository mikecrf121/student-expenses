import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AddStudentExpensePage } from "./add-student-expense";
import { IonicModule } from "@ionic/angular";
import { FormsModule } from "@angular/forms";
import { AddStudentExpensePageRoutingModule } from "./add-student-expense-routing.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddStudentExpensePageRoutingModule,
  ],
  declarations: [AddStudentExpensePage],
})
export class AddStudentExpenseModule {}
