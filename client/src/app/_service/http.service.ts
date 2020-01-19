import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../_models/user';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient,
    private session: SessionService
  ) { }

  /**
   * Sends an HTTP POST request to the server and returns the response,
   * while also updating any session information
   * @param url URL path on the server to send request to
   * @param body Any data to send to the server
   */
  post(url: string, body: Object): any {
    this.http.post("http://51.11.10.177:3000/" + url, body, {
      withCredentials: true
    }).subscribe((res: any) => {
      var userProfile: User = res.userProfile;
      this.session.setSessionData(userProfile);

      return res.body;
    });
  }

  /**
   * Sends an HTTP GET request to the server and returns the response,
   * while also updating any session information
   * @param url URL path on the server to send request to
   */
  get(url: string) {
    this.http.get("http://51.11.10.177:3000/" + url, {
      withCredentials: true
    }).subscribe((res: any) => {
      var userProfile: User = res.userProfile;
      this.session.setSessionData(userProfile);

      return res.body;
    });
  }
  
}
