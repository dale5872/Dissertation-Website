import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../_models/user';
import { BootstrapAlertService } from 'ngx-bootstrap-alert-service';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';

const TOKEN = 'TOKEN';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private _isAuthenticatedSubject: BehaviorSubject<boolean>;
  private isAuthenticated: Observable<boolean>;
  
  constructor(
    private alertService: BootstrapAlertService,
    private router: Router,
    private cookieService: CookieService,
    private http: HttpClient,
  ) { 
    this._isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    this.isAuthenticated = this._isAuthenticatedSubject.asObservable();
  }

  getUsername() {
    return this.cookieService.get("username");
  }

  getFirstName() {
    return this.cookieService.get("fname");
  }

  getLastName() {
    return this.cookieService.get("lname");
  }

  getEmail() {
    return this.cookieService.get("email");
  }

  /**
   * Takes the user profile and stores them in cookies for use within the app
   * @param profile Class storing the logged in users information
   */
  setSessionData(profile: User) {
    this.cookieService.set("username", profile.username, 360, '/', '51.11.10.177', false);
    this.cookieService.set("fname", profile.fname, 360, '/', '51.11.10.177', false);
    this.cookieService.set("lname", profile.lname, 360, '/', '51.11.10.177', false);
    this.cookieService.set("email", profile.email, 360, '/', '51.11.10.177', false);
    this._isAuthenticatedSubject.next(true);
  }

  /**
   */
  isLoggedIn() {
    if(this.cookieService.get('username') !== '') {
      this._isAuthenticatedSubject.next(true);
      this.checkValidCookie();
      return true;
    }

    return false;
  }

  /**
   */
  isLoggedInObservable() {
    if(this.cookieService.get("username") != '') {
      this._isAuthenticatedSubject.next(true);
      this.checkValidCookie();
    }
    this._isAuthenticatedSubject.next(false);
    return this.isAuthenticated;
  }

  checkValidCookie() {
    this.http.get("http://51.11.10.177:3000/api/validate/cookie", {
      withCredentials: true
    }).subscribe(() => {
      return true;
    }, (error) => {
      if(error.status === 401) {
        this.logout();
      } 
      return false;
    });
  }

  /**
   */
  logout() {
    sessionStorage.clear();
    this.cookieService.deleteAll('/', '51.11.10.177');

    this.http.delete('http://51.11.10.177:3000/api/destroy/session', {
      withCredentials: true
    }).subscribe(() => {
    }, (error) => {
    });

    this._isAuthenticatedSubject.next(false);
    this.router.navigateByUrl('/');
  }

  redirectUnauthenticatedUser() {
    this.router.navigateByUrl('/');
    this.alertService.showError("Unauthorized user! Please log in to access that area!")
  }

  sessionExpired() {
    this.logout();
    this.alertService.showError("Session expired. Please log in again.");
  }
}
