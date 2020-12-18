import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
import { map, finalize, catchError } from "rxjs/operators";

import { environment } from "@environments/environment";
import { Account, Expense, Report } from "@app/_models";
import { AccountsPage } from "@app/pages/admin/accounts/accounts";

const baseUrl = `${environment.apiUrl}/accounts`;

@Injectable({ providedIn: "root" })
export class AccountService {
  public accountSubject: BehaviorSubject<Account>;
  public account: Observable<Account>;

  constructor(private router: Router, private http: HttpClient) {
    this.accountSubject = new BehaviorSubject<Account>(null);
    this.account = this.accountSubject.asObservable();
  }

  public get accountValue(): Account {
    return this.accountSubject.value;
  }

  async login(email: string, password: string) {
    this.accountSubject.next(null);
    return this.http
      .post<any>(
        `${baseUrl}/authenticate`,
        { email, password },
        { withCredentials: true }
      )
      .pipe(
        map(async (account) => {
          this.accountSubject.next(account);
          this.startRefreshTokenTimer();
          return account;
        })
      );
  }

  async logout() {
    this.http
      .post<any>(`${baseUrl}/revoke-token`, {}, { withCredentials: true })
      .subscribe();
    this.stopRefreshTokenTimer();
    this.accountSubject.next(null);
    //This bellow is really cool
    //this.accountSubject.subscribe(x => console.log(x,"This should be undefined???"));
    this.router.navigateByUrl("/login");
  }

  refreshToken() {
    return this.http
      .post<any>(`${baseUrl}/refresh-token`, {}, { withCredentials: true })
      .pipe(
        map(async (account) => {
          this.accountSubject.next(account);
          await this.startRefreshTokenTimer();
          return account;
        })
      );
  }

  async register(account: Account) {
    return this.http.post(`${baseUrl}/register`, account);
  }

  async verifyEmail(token: string) {
    return this.http.post(`${baseUrl}/verify-email`, { token });
  }

  async forgotPassword(email: string) {
    return this.http.post(`${baseUrl}/forgot-password`, { email });
  }

  async validateResetToken(token: string) {
    return this.http.post(`${baseUrl}/validate-reset-token`, { token });
  }

  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string
  ) {
    return this.http.post(`${baseUrl}/reset-password`, {
      token,
      password,
      confirmPassword,
    });
  }

  async getAll() {
    return this.http.get<Account[]>(baseUrl);

    //tests
    /*const http$ = this.http.get<Account[]>(baseUrl);
    const timeStart = Date.now();
    http$
        .pipe(
          map((accounts) => {

            return accounts;
          }),
            catchError(err => {
                console.log('caught mapping error and rethrowing', err);
                return throwError(err);
            }),
            catchError(err => {
                console.log('caught rethrown error, providing fallback value');
                return of([]);
            })
        )
        .subscribe(
            res => console.log(timeStart-Date.now(),'HTTP response', res),
            err => console.log('HTTP Error', err),
            () => console.log('HTTP request completed.')
        );
*/
  }

  async getById(accountId: string) {
    return this.http.get<Account>(`${baseUrl}/${accountId}`);
  }

  async getByEmail(accountEmail: string) {
    return this.http.get<Account>(`${baseUrl}/${accountEmail}/by-email`);
  }

  async getAllStudents(reportsManagerId: string) {
    return this.http.get<Account>(`${baseUrl}/${reportsManagerId}/students`);
  }

  async getAllStudentsByReportId(reportId: string) {
    return this.http.get<Account[]>(`${baseUrl}/${reportId}/report-students`);
  }

  //***** For create account page for admins, get all reportsmanagers and admins who can also be a reports manager
  // I only want Name and there ID back
  async getAllReportsManagers() {
    return this.http.get<Account[]>(`${baseUrl}/reports-managers-list`);
  }
  //***** For create account page for admins, get all reportsManager Reports
  // Should probably move this reports servic
  async getAllReportsManagerReports(reportsManagerId: string) {
    return this.http.get<Report[]>(
      `${baseUrl}/${reportsManagerId}/reports-manager-reports`
    );
  }

  // Reports Manager Routes
  async getReportsExpenses(reportsManagerId: string) {
    return this.http.get<Account>(
      `${baseUrl}/${reportsManagerId}/expenses-on-reports`
    );
  }
  async getAllReportsOnAccount(reportsManagerId: string) {
    return this.http.get<Report>(`${baseUrl}/${reportsManagerId}/reports`);
  }
  async getAllExpensesInReports(reportsManagerId: string) {
    return this.http.get<Report>(
      `${baseUrl}/${reportsManagerId}/reports-expenses`
    );
  }
  // should probably more this to expense service..
  async getAllExpensesOnAccount(accountId: string) {
    return this.http.get<Expense>(`${baseUrl}/${accountId}/expenses`);
  }

  async create(params: any) {
    return this.http.post(baseUrl, params);
  }

  async update(accountId: string, params: any) {
    return this.http.put(`${baseUrl}/${accountId}`, params).pipe(
      map(async (account: any) => {
        // update the current account if it was updated
        if (account.id === this.accountValue.id) {
          // publish updated account to subscribers
          account = await { ...this.accountValue, ...account };
          this.accountSubject.next(account);
        }
        return account;
      })
    );
  }

  async updatePersonalReportsList(
    accountId: string,
    reportId: string,
    params?: any
  ) {
    //console.log(params)
    return this.http
      .put(`${baseUrl}/personal-reports-list/${accountId}/${reportId}`, params)
      .pipe(
        map(async (personalReportsList: any) => {
          return personalReportsList;
        })
      );
  }

  async delete(id: string) {
    return this.http.delete(`${baseUrl}/${id}`).pipe(
      finalize(async () => {
        // auto logout if the logged in account was deleted
        if (id === this.accountValue.id) this.logout();
      })
    );
  }

  // helper methods

  private refreshTokenTimeout: any;

  private async startRefreshTokenTimer() {
    // parse json object from base64 encoded jwt token
    const jwtToken = await JSON.parse(
      atob(this.accountValue.jwtToken.split(".")[1])
    );
    // set a timeout to refresh the token a minute before it expires
    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - 60 * 1000;
    this.refreshTokenTimeout = setTimeout(
      async () => this.refreshToken().subscribe(),
      timeout
    );
  }

  private async stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}
