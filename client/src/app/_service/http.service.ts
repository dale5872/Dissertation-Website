import { Injectable, getModuleFactory } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../_models/user';
import { SessionService } from './session.service';
import { ThrowStmt } from '@angular/compiler';

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
    }, (error) => {
      throw new Error(error.message);
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

  uploadFile(file: File): any {
    //File must be added to a FormData object to be sent to the server
    let formData = new FormData();
    formData.append('file', file, file.name);

    this.http.post("http://51.11.10.177:3000/api/uploadfile", formData, {
      withCredentials: true,
      responseType: 'text'
    }).subscribe((res: any) => {
      console.log(res.body);
      return res.body;
    }, (error) => {
      throw new Error(error.message);
    });
  }
}
