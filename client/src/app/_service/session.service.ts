import { Injectable } from '@angular/core';

const TOKEN = 'TOKEN';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor() { }

  isLoggedIn() {
    return localStorage.getItem("JWT") != null;
  }
}
