import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";

import { AccountsPage } from "./accounts";
import { AccountsFilterPage } from "./accounts-filter/accounts-filter";
import { AccountsPageRoutingModule } from "./accounts-routing.module";

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, AccountsPageRoutingModule],
  declarations: [AccountsPage, AccountsFilterPage],
  entryComponents: [AccountsFilterPage],
})
export class AccountsModule {}
