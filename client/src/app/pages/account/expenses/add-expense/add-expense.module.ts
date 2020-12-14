import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AddExpensePage } from "./add-expense";
import { IonicModule } from "@ionic/angular";
import { FormsModule } from "@angular/forms";
import { AddExpensePageRoutingModule } from "./add-expense-routing.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddExpensePageRoutingModule,
  ],
  declarations: [AddExpensePage],
})
export class AddExpenseModule {}
