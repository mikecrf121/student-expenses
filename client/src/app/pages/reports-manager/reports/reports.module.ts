import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { FormsModule } from "@angular/forms";

import { ReportsListPage } from "./reports";
import { ReportsListPageRoutingModule } from "./reports-routing.module";
import { ReportsFilterPage } from "./reports-filter/reports-filter";

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    IonicModule,
    ReportsListPageRoutingModule,
  ],
  declarations: [ReportsListPage,ReportsFilterPage],
  entryComponents: [ReportsFilterPage],
})
export class ReportsListModule {}
