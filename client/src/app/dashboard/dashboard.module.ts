import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { UploadfileComponent } from './uploadfile/uploadfile.component';
import { ViewuploadsComponent } from './viewuploads/viewuploads.component';
import { ViewreponsesComponent } from './viewuploads/viewreponses/viewreponses.component';


@NgModule({
  declarations: [
    DashboardComponent,
    UploadfileComponent,
    ViewuploadsComponent,
    ViewreponsesComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
