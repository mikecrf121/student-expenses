import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { StudentsListPage } from "./students";
const routes: Routes = [
  {
    path: "",
    component: StudentsListPage,
  },
  {
    path: "add",
    loadChildren: () =>
      import(
        "@app/pages/reports-manager/students/add-student/add-student.module"
      ).then((m) => m.AddStudentModule),
  },
  {
    path: "student-details/:studentId",
    loadChildren: () =>
      import(
        "@app/pages/reports-manager/students/student-details/student-details.module"
      ).then((m) => m.StudentDetailsModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentsListPageRoutingModule {}
