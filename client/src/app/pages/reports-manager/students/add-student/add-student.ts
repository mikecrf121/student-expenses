import { Component } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";
import { Location } from "@angular/common";

import { UserOptions } from "@app/_interfaces";
import { AccountService, AlertService, ReportService } from "@app/_services";
import { Account } from "@app/_models";

@Component({
  selector: "page-add-student",
  templateUrl: "add-student.html",
  styleUrls: ["./add-student.scss"],
})
export class AddStudentPage {
  signup: UserOptions = {
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    acceptTerms: false,
    reportId: "",
    reportsManagerId: "",
    password: "",
    confirmPassword: "",
  };
  submitted: boolean = false;

  accountId: string;
  reportId: string;
  saving: boolean = true;
  loading: Promise<HTMLIonLoadingElement>;
  addingStudent: Promise<HTMLIonLoadingElement>;
  reportsManagerId: string;
  reportsManager: Account;
  currentRoute: string = this.router.url;

  constructor(
    public route: ActivatedRoute,
    public alertService: AlertService,
    public accountService: AccountService,
    private reportService: ReportService,
    private _location: Location,
    private router: Router
  ) {}

  async ionViewWillEnter() {
    this.loading = this.alertService.presentLoading("Student Expenses App");
    (await this.loading).present();
    // if your not an admin get id's out of the url
    if (this.accountService.accountValue.role != "Admin") {
      window.history.replaceState(
        {},
        document.title,
        "/" + "reports-manager/reports/report-details/students/add"
      );
    }
    // No reportId in url for non admins
    this.reportId = this.route.snapshot.paramMap.get("reportId");
    // get report, then the reportManagerId
    if (this.reportId != null) {
      (await this.reportService.getById(this.reportId))
        .forEach(async (Element) => {
          this.reportsManagerId = Element.reportsManagerId;
        })
        .finally(async () => {
          setTimeout(async () => {
            (await this.loading).dismiss();
          }, 300);
        });
    } else {
      // This means a non admin is creating a student, so just take this accountValue.id for reportsManagerId
      this.reportsManagerId = this.accountService.accountValue.id;
      setTimeout(async () => {
        (await this.loading).dismiss();
      }, 300);
    }
  }

  //async ionViewDidEnter() {}

  // Big Function For This Page, FOR SURE A MORE ELEGANT WAY OF DOING THIS>>>>>>>!!!!!
  async onAddStudent(form?: NgForm) {
    this.addingStudent = this.alertService.presentLoading("Adding Student;");
    (await this.addingStudent).present();
    // stop here if form is invalid
    if (form.invalid) {
      (await this.addingStudent).dismiss();
      return;
    }
    // Checking if Account Already Exists
    const accountFinder$ = await this.accountService.getByEmail(
      form.value.email
    );

    // Sunscribing to the accountFinder for when its done....
    accountFinder$.subscribe(async (res) => {
      const account = res; // <--- Just so its easier to work with
      // ______________If No Account found..._____If Account Found...
      account == null ? this.workFlow1(form) : this.workFlow2(account);
    });
  }

  // No account so.. creating one for them
  async workFlow1(form?: NgForm) {
    // Create new account and send invite email
    await this.createNewStudentAccount(form).finally(async () => {
      this.alertService.createToastAlert(
        "Student Account Created Successfully.. Resuming...",
        "success",
        15000
      );
      (await this.addingStudent).dismiss();
      // re initiating the function....
      this.onAddStudent(form);
    });
  }

  async workFlow2(account: Account) {
    // Check if already asigned to another reports manager
    // Check if student alread exists on current Report Students list...
    // Yes, Alert already asigned to another reports manager
    if (account.reportsManagerId != this.reportsManagerId) {
      (await this.addingStudent).dismiss();
      this.alertService.createToastAlert(
        "Student Already Assigned To Another Reports Manager!",
        "danger",
        15000
      );
    } else {
      // Add student to report students list
      if (this.reportId) {
        // Check if already on this report then return...
        const onListAlready$ = await this.reportService.getOnReportStudentsListChecker(
          this.reportId,
          account.id
        );
        onListAlready$.subscribe(async (res) => {
          //console.log(res)
          if (res==true) {
            (await this.addingStudent).dismiss();
            this.alertService.createToastAlert(
              "Student Already Assigned To This Report!",
              "danger",
              15000
            );
            return;
          } else {
            await this.continueJob(account);
          }
        });
      } else {
        (await this.addingStudent).dismiss();
        this.alertService.createToastAlert(
          "Student Added Succefully!",
          "success",
          15000
        );
      }
    }
  }

  async continueJob(account: any) {
    await this.addStudentToReportStudentsList(this.reportId, account.id)
      .then(async () => {
        // Add Report To students personal reports list
        await this.addReportToAccountsPersonalReportsList(
          account.id,
          this.reportId
        );
      })
      .finally(async () => {
        this.alertService.createToastAlert(
          "Student Added To Report Successfully!",
          "success",
          15000
        );
        (await this.addingStudent).dismiss();
      });
  }

  // If No Account already exists, create new account for student and will send invite email
  async createNewStudentAccount(form?: NgForm) {
    // creating variables for default account
    form.value.reportsManagerId = this.reportsManagerId;
    this.reportId != undefined
      ? (form.value.reportId = this.reportId)
      : (form.value.reportId = "None Assigned");

    form.value.password = "StudentExpenses123";
    form.value.confirmPassword = "StudentExpenses123";

    if (!form.value.title) {
      form.value.title = "N/A";
    }
    // If no account exists, Do This...
    (await this.accountService.register(form.value)).pipe(first()).subscribe({
      next: async () => {
        await this.alertService
          .createToastAlert(
            "Invite Email To Student Sent Successfully",
            "success",
            5000
          )
          .finally(async () => {
            this._location.back();
            (await this.addingStudent).dismiss();
          });
      },
      error: async (error) => {
        await this.alertService.createToastAlert(
          "Invite Email Sent Failed!",
          "danger",
          5000
        );
        (await this.addingStudent).dismiss();
      },
    });
  }

  // Add the Student/Account to the Report Students List
  async addStudentToReportStudentsList(reportId: string, studentId: string) {
    (await this.reportService.updateReportStudentsList(reportId, studentId))
      .pipe(first())
      .subscribe({
        next: async () => {
          await this.alertService.createToastAlert(
            "Student Added To Report Students List Successful!",
            "success",
            2000
          );
        },
        error: async (error) => {
          await this.alertService.createToastAlert(
            "Add Student To Report Students List Failed...!",
            "danger",
            5000
          );
        },
      });
  }

  // Add Report To Account/Student Personal Reports List
  async addReportToAccountsPersonalReportsList(
    accountId: string,
    reportId: string
  ) {
    (await this.accountService.updatePersonalReportsList(accountId, reportId))
      .pipe(first())
      .subscribe({
        next: async () => {
          await this.alertService.createToastAlert(
            "Report Added To Students Persoanl Reports List Successful!",
            "success",
            2000
          );
        },
        error: async (error) => {
          await this.alertService.createToastAlert(
            "Add Report To Students Persoanl Reports List Failed...!",
            "danger",
            5000
          );
        },
      });
  }
}
