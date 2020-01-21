import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { UploadfileComponent } from './uploadfile/uploadfile.component';
import { ViewuploadsComponent } from './viewuploads/viewuploads.component';


@NgModule({
  declarations: [
    DashboardComponent,
    UploadfileComponent,
    ViewuploadsComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
