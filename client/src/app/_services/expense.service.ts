import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { map, finalize } from "rxjs/operators";

import { environment } from "@environments/environment";
import { Expense } from "@app/_models";

const baseUrl = `${environment.apiUrl}/expenses`;

@Injectable({ providedIn: "root" })
export class ExpenseService {
  private ExpenseSubject: BehaviorSubject<Expense>;
  public Expense: Observable<Expense>;

  constructor(private http: HttpClient) {
    this.ExpenseSubject = new BehaviorSubject<Expense>(null);
    this.Expense = this.ExpenseSubject.asObservable();
  }

  public get ExpenseTestValue(): Expense {
    return this.ExpenseSubject.value;
  }

  async getAll() {
    return this.http.get<Expense[]>(baseUrl);
  }

  async getById(id: string) {
    return this.http.get<Expense>(`${baseUrl}/${id}`);
  }

  async getAllExpensesByReportId(reportId: string) {
    return this.http.get<Expense[]>(`${baseUrl}/${reportId}/report-expenses`);
  }

  async create(params: any) {
    return this.http.post(baseUrl, params);
  }

  async update(id: string, params) {
    return this.http.put(`${baseUrl}/${id}`, params).pipe(
      map(async (expense: any) => {
        // update the current Expense if it was updated
        // if (Expense.id === this.ExpenseTestValue.id) {
        // publish updated Expense to subscribers
        //    Expense = { ...this.ExpenseTestValue, ...Expense };
        //    this.ExpenseSubject.next(Expense);
        // }
        return expense;
      })
    );
  }

  async delete(id: string) {
    return this.http.delete(`${baseUrl}/${id}`).pipe(
      finalize(async () => {
        // not sure if needed
      })
    );
  }
}
