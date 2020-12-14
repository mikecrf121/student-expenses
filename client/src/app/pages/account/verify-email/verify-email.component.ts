import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { first } from "rxjs/operators";

import { AccountService, AlertService } from "@app/_services";

enum EmailStatus {
  Verifying,
  Failed,
}

@Component({ templateUrl: "verify-email.component.html" })
export class VerifyEmailComponent implements OnInit {
  EmailStatus = EmailStatus;
  emailStatus = EmailStatus.Verifying;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private toastAlert: AlertService
  ) {}

  async ngOnInit() {
    const token = await this.route.snapshot.queryParams["token"];
    // remove token from url to prevent http referer leakage
    await this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
    });
    (await this.accountService.verifyEmail(await token))
      .pipe(first())
      .subscribe({
        next: async () => {
          await this.router.navigateByUrl("/login");
          // Toast notification that email was verefied!!!
          await this.toastAlert.createToastAlert(
            "Email Verefied Successfully, You May Now Log Into Student Expenses",
            "success",
            5000
          );
        },
        error: async () => {
          this.emailStatus = EmailStatus.Failed;
        },
      });
  }
}
