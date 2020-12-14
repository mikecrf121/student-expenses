import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ExpenseDetailsPage } from "./expense-details";
import { ExpenseDetailsPageRoutingModule } from "./expense-details-routing.module";
import { IonicModule } from "@ionic/angular";

@NgModule({
  imports: [CommonModule, IonicModule, ExpenseDetailsPageRoutingModule],
  declarations: [ExpenseDetailsPage],
})
export class ExpenseDetailsModule {}
