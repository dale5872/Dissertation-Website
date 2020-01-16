import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

const TOKEN = 'TOKEN';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private _isAuthenticatedSubject: BehaviorSubject<boolean>;
  private isAuthenticated: Observable<boolean>;

  constructor() { 
    this._isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    this.isAuthenticated = this._isAuthenticatedSubject.asObservable();
  }

  beginSession(profile) {
    localStorage.setItem("JWT", profile.sessionID);
    sessionStorage.setItem("username", profile.username);
    sessionStorage.setItem("firstName", profile.firstName);
    sessionStorage.setItem("lastName", profile.lastName);
    sessionStorage.setItem("email", profile.email);    
    this._isAuthenticatedSubject.next(true);
  }

  isLoggedIn() {
    return localStorage.getItem("JWT") != null;
  }

  isLoggedInObservable() {
    if(localStorage.getItem("JWT") != null) {
      this._isAuthenticatedSubject.next(true);
    } else {
      this._isAuthenticatedSubject.next(false);
    }

    return this.isAuthenticated;
  }

  logout() {
    if(this.isLoggedIn()) {
      localStorage.clear();
      sessionStorage.clear();
      this._isAuthenticatedSubject.next(false);
    }
  }
}
