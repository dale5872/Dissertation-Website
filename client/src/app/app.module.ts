import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './_guards/auth.guard';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BootstrapAlertModule } from 'ngx-bootstrap-alert-service';
import { CookieService } from 'ngx-cookie-service';
import { QuestionnaireComponent } from './questionnaire/questionnaire.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    QuestionnaireComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    BootstrapAlertModule
  ],
  providers: [
    AuthGuard,
    CookieService,
    Title
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
