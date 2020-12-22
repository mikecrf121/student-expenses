import { Role } from "./role";
import { Expense } from "./expense";
import { Status } from "./status";

export class Account {
  id: string;
  reportId?: string;
  reportsManagerId?: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  jwtToken?: string;
  created: string;
  isVerified: boolean;
  updated: string;
  lastLogin: string;
  isOnline: boolean;
  studentExpenses?: [Expense];
  studentExpensesCount?: number;
  reportsManager?: any;
  reportsManagerStudentsCount?: number;
  reportsManagerExpensesCount?: number;
  reportsManagerReports?: any;
  studentReport?: any;
  status: Status;
  verificationToken:string; // This is probably a bad idea.
  personalReportsList: any;
}
