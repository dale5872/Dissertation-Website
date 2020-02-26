import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../_models/user';
import { RegistrationModel } from '../_models/registration';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<User> {
    return this.http.post<User>('http://51.11.10.177:3000/api/auth/login', {
      username: username,
      password: password
    }, {
      withCredentials: true
    });
  }

  register(profile: RegistrationModel) {
    return this.http.post('http://51.11.10.177:3000/api/auth/register', {
      username: profile.username,
      password: profile.password,
      email: profile.email,
      fname: profile.firstName,
      lname: profile.lastName,
    }, {
      withCredentials: true
    });
  }
}
