import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { CookieService } from 'ngx-cookie-service';
import { triggerAsyncId } from 'async_hooks';

const TOKEN = 'TOKEN';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private _isAuthenticatedSubject: BehaviorSubject<boolean>;
  private isAuthenticated: Observable<boolean>;
  
  constructor(
    private cookieService: CookieService
  ) { 
    this._isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    this.isAuthenticated = this._isAuthenticatedSubject.asObservable();
  }

  getUsername() {
    return JSON.parse(this.cookieService.get("fbh_pf")).username;
  }

  getFirstName() {
    return JSON.parse(this.cookieService.get("fbh_pf")).fname;
  }

  getLastName() {
    return JSON.parse(this.cookieService.get("fbh_pf")).lname;
  }

  getEmail() {
    return JSON.parse(this.cookieService.get("fbh_pf")).email;
  }

  /**
   * Takes the user profile and stores them in cookies for use within the app
   * @param profile Class storing the logged in users information
   */
  beginSession(profile) {
    this.cookieService.set("fbh_pf", JSON.stringify(profile));
    this._isAuthenticatedSubject.next(true);
  }

  /**
   */
  isLoggedIn() {
    if(this.cookieService.check("fbh_pf") != null) {
      this._isAuthenticatedSubject.next(true);
      return true;
    }

    return false;
  }

  /**
   */
  isLoggedInObservable() {
    if(this.cookieService.check("fbh_pf") != null) {
      this._isAuthenticatedSubject.next(true);
    }
    this._isAuthenticatedSubject.next(false);
    return this.isAuthenticated;
  }

  /**
   */
  logout() {
    this.cookieService.deleteAll();
    this._isAuthenticatedSubject.next(false);
  }
}
