import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { map, finalize } from "rxjs/operators";

import { environment } from "@environments/environment";
import { Report } from "@app/_models";

const baseUrl = `${environment.apiUrl}/reports`;

@Injectable({ providedIn: "root" })
export class ReportService {
  private ReportSubject: BehaviorSubject<Report>;
  public Report: Observable<Report>;

  constructor(private http: HttpClient) {
    this.ReportSubject = new BehaviorSubject<Report>(null);
    this.Report = this.ReportSubject.asObservable();
  }

  public get ReportValue(): Report {
    return this.ReportSubject.value;
  }

  async getAll() {
    return this.http.get<Report[]>(baseUrl);
  }

  async getById(id: string) {
    return this.http.get<Report>(`${baseUrl}/${id}`);
  }

  async getStudentByReportId(reportId: string) {
    const student = this.http.get<Report>(`${baseUrl}/${reportId}/student`);
    return student;
  }

  // Used to check if student is on report student list already..
  async getOnReportStudentsListChecker(reportId: string, accountId:string) {
    const reportStudentsListCheck = this.http.get<any>(`${baseUrl}/report-students-list/${reportId}/${accountId}/check-if-on`);
    return reportStudentsListCheck;
  }


  async create(params: any) {
    return this.http.post(baseUrl, params);
  }

  async update(id: string, params: any) {
    return this.http.put(`${baseUrl}/${id}`, params).pipe(
      map(async (report: any) => {
        return report;
      })
    );
  }

  async updateReportStudentsList(reportId: string, accountId: string,body?:any) {
    return this.http
      .put(`${baseUrl}/report-students-list/${reportId}/${accountId}`,body)
      .pipe(
        map(async (reportStudentsList: any) => {
          return reportStudentsList;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${baseUrl}/${id}`).pipe(finalize(() => {}));
  }
}
