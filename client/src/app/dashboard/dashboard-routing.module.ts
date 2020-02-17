import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../_guards/auth.guard';
import { DashboardComponent } from './dashboard.component';
import { UploadfileComponent } from './uploadfile/uploadfile.component';
import { ViewuploadsComponent } from './viewuploads/viewuploads.component';
import { ViewreponsesComponent } from './viewuploads/viewreponses/viewreponses.component';
import { ViewanalysisComponent } from './viewanalysis/viewanalysis.component';
import { ViewComponent } from './viewanalysis/view/view.component';
import { FullComponent } from './viewanalysis/full/full.component';
import { DashboardContentComponent } from './dashboard-content/dashboard-content.component';



const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: DashboardContentComponent,
        canActivate: [AuthGuard],
      },
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
      },
      {
        path: 'viewanalysis',
        component: ViewanalysisComponent,
        canActivate: [AuthGuard],
        children: [
          {
            path: 'view/:importid/:questionnaireid',
            component: ViewComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'full/:importid/:questionnaireid',
            component: FullComponent,
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
