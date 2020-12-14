import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";

import { ExpensesPage } from "./expenses";
import { ExpensesFilterPage } from "./expenses-filter/expenses-filter";
import { ExpensesPageRoutingModule } from "./expenses-routing.module";

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ExpensesPageRoutingModule],
  declarations: [ExpensesPage, ExpensesFilterPage],
  entryComponents: [ExpensesFilterPage],
})
export class ExpensesModule {}
