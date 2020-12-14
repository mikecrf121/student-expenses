import { CurrencyPipe } from "@angular/common";

export interface ExpenseOptions {
  studentId?: string;
  reportId?: string;
  reportsManagerId?: string;
  expenseName: string;
  expenseCost: string;
  expenseCategory: string; //<---- could be converted to an enum
}
