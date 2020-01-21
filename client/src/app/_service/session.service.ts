import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { CookieService } from 'ngx-cookie-service';
import { User } from '../_models/user';

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
    return sessionStorage.getItem("username");
  }

  getFirstName() {
    return sessionStorage.getItem("fname");
  }

  getLastName() {
    return sessionStorage.getItem("lname");
  }

  getEmail() {
    return sessionStorage.getItem("email");
  }

  /**
   * Takes the user profile and stores them in cookies for use within the app
   * @param profile Class storing the logged in users information
   */
  setSessionData(profile: User) {
    sessionStorage.setItem("username", profile.username);
    sessionStorage.setItem("fname", profile.fname);
    sessionStorage.setItem("lname", profile.lname);
    sessionStorage.setItem("email", profile.email);
    this._isAuthenticatedSubject.next(true);
  }

  /**
   */
  isLoggedIn() {
    if(sessionStorage.getItem("username") != null) {
      this._isAuthenticatedSubject.next(true);
      return true;
    }
    return false;
  }

  /**
   */
  isLoggedInObservable() {
    if(sessionStorage.getItem("username") != null) {
      this._isAuthenticatedSubject.next(true);
    }
    this._isAuthenticatedSubject.next(false);
    return this.isAuthenticated;
  }

  /**
   */
  logout() {
    sessionStorage.clear();
    this._isAuthenticatedSubject.next(false);
  }
}
