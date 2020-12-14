import { Status } from "./status";

export class Report {
  id: string; //<-- The Id of the report
  reportsManagerId: string; //<-- The Account Id of the reports manager
  reportName?: string;
  reportStudents: any;
  reportExpenses: any[];
  reportExpensesCount: number;
  expenseStudent: any;
  expenseReport: any;
  created: any;
  reportsManager: any;
  status: Status;
}
