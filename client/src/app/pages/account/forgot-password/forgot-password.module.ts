import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";

import { ForgotPasswordPage } from "./forgot-password";
import { ForgotPasswordPageRoutingModule } from "./forgot-password-routing.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ForgotPasswordPageRoutingModule,
  ],
  declarations: [ForgotPasswordPage],
})
export class ForgotPasswordModule {}
