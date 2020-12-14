import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { FormsModule } from "@angular/forms";
import { ExpensesListPage } from "./expenses-list";
import { ExpensesListPageRoutingModule } from "./expenses-list-routing.module";
import { ExpensesFilterPage } from "./expenses-filter/expenses-filter";

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ExpensesListPageRoutingModule,
    FormsModule,
  ],
  declarations: [ExpensesListPage, ExpensesFilterPage],
  entryComponents: [ExpensesFilterPage],
})
export class ExpensesListModule {}
