// TODO implement this so you CANT navigate to say the login page if your already logged in
import { Injectable } from "@angular/core";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";

import { AccountService } from "@app/_services";

@Injectable({ providedIn: "root" })
export class LoggedInGuard implements CanActivate {
  constructor(
    private router: Router,
    private accountService: AccountService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const account = this.accountService.accountValue;
    // if not logged in go ahead you can get to the page
    if (!account) {
      // authorized so return true
      return true;
    }
    // your already logged in and dont need to ever go there logged in, redirect home
    this.router.navigate(["/home"]);
    return false;
  }
}
