import { Status } from "./status";

export class Expense {
  id: string;
  studentId: string;
  reportId?: string;
  reportsManagerId?: string;
  created?: string;
  expenseName: string;
  expenseCost: string;
  expenseCategory: string;
  expenseStudent: any;
  expenseReport: any;
  expenseReportsManager: any;
  status: Status;
}
