import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../_guards/auth.guard';
import { DashboardComponent } from './dashboard.component';
import { UploadfileComponent } from './uploadfile/uploadfile.component';
import { ViewuploadsComponent } from './viewuploads/viewuploads.component';
import { ViewreponsesComponent } from './viewuploads/viewreponses/viewreponses.component';



const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'uploadfile',
        component: UploadfileComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'viewuploads',
        component: ViewuploadsComponent,
        canActivate: [AuthGuard],
        children: [
          {
            path: 'viewresponses/:importid/:questionnaireid',
            component: ViewreponsesComponent,
            canActivate: [AuthGuard]
          }
        ]

      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
