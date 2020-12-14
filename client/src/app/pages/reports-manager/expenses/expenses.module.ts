import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { FormsModule } from "@angular/forms";

import { ExpensesListPage } from "./expenses";
import { ExpensesListPageRoutingModule } from "./expenses-routing.module";
import { ExpensesFilterPage } from "./expenses-filter/expenses-filter";

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    IonicModule,
    ExpensesListPageRoutingModule,
  ],
  declarations: [ExpensesListPage, ExpensesFilterPage],
  entryComponents: [ExpensesFilterPage],
})
export class ExpensesListModule {}
