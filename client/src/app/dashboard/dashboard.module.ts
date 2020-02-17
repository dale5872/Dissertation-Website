import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { UploadfileComponent } from './uploadfile/uploadfile.component';
import { ViewuploadsComponent } from './viewuploads/viewuploads.component';
import { ViewreponsesComponent } from './viewuploads/viewreponses/viewreponses.component';
import { ViewanalysisComponent } from './viewanalysis/viewanalysis.component';
import { ViewComponent } from './viewanalysis/view/view.component';
import { FullComponent } from './viewanalysis/full/full.component';
import { DashboardContentComponent } from './dashboard-content/dashboard-content.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    DashboardComponent,
    UploadfileComponent,
    ViewuploadsComponent,
    ViewreponsesComponent,
    ViewanalysisComponent,
    ViewComponent,
    FullComponent,
    DashboardContentComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class DashboardModule { }
