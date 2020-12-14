import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";

import { Account } from "./account";
import { AccountRoutingModule } from "./account-routing.module";
import { FormsModule } from "@angular/forms";

@NgModule({
  imports: [FormsModule, CommonModule, IonicModule, AccountRoutingModule],
  declarations: [Account],
})
export class AccountModule {}
