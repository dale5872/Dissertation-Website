import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BootstrapAlertService, ToastMessageModel } from 'ngx-bootstrap-alert-service';

import { SessionService } from './_service/session.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isAuthenticated: boolean;
  title = 'client';
  messageList: ToastMessageModel[] = [];

  constructor(
    private session: SessionService,
    private router: Router,
    private cookieService: CookieService,
    private alertService: BootstrapAlertService
  ) { }

  ngOnInit() {
    this.session.isLoggedInObservable().subscribe((isAuth) => {
      this.isAuthenticated = isAuth
    });

    //sets up the alert system
    this.alertService.getAlertEvent().subscribe(r => {
      this.messageList.push(r);
    });
  }

  /**
   * Begins the Logout procedure through the session interface
   */
  logout() {
    this.session.logout();
  }

  /**
   * Returns the current users username
   */
  getUsername() {
    return this.session.getUsername();
  }

  /**
   * Returns the current users first name
   */
  getFirstName() {
    return this.session.getFirstName();
  }

  /**
   * Returns the current users last name
   */
  getLastName() {
    return this.session.getLastName();
  }

  displayNavBar() {
    var regexp = RegExp('/questionnaire/.');
    if(regexp.test(this.router.url)) return false;
    
    return true;
  }

  
}
