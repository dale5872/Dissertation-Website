import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../_guards/auth.guard';
import { DashboardComponent } from './dashboard.component';
import { UploadfileComponent } from './uploadfile/uploadfile.component';
import { ViewuploadsComponent } from './viewuploads/viewuploads.component';



const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'uploadfile',
        component: UploadfileComponent
      },
      {
        path: 'viewuploads',
        component: ViewuploadsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
