import { Injectable, getModuleFactory } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BootstrapAlertService } from 'ngx-bootstrap-alert-service';

import { User } from '../_models/user';
import { SessionService } from './session.service';
import { HttpReturn } from '../_models/httpReturn';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient,
    private session: SessionService,
    private alertService: BootstrapAlertService
  ) { }

  /**
   * Sends an HTTP POST request to the server and returns the response,
   * while also updating any session information
   * @param url URL path on the server to send request to
   * @param body Any data to send to the server
   */
  post(url: string, body: Object): any {
    return new Promise((resolve, reject) => {
      this.http.post("http://51.11.10.177:3000/" + url, body, {
        withCredentials: true
      }).subscribe((res: HttpReturn) => {
        var userProfile: User = res.userProfile;
        this.session.setSessionData(userProfile);
  
        resolve(res.dataObject);
      }, (error) => {
        reject(error.message);
      });

    });
  }

  /**
   * Sends an HTTP GET request to the server and returns the response,
   * while also updating any session information
   * @param url URL path on the server to send request to
   */
  get(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get("http://51.11.10.177:3000/" + url, {
        withCredentials: true
      }).subscribe((res: HttpReturn) => {
        var userProfile: User = res.userProfile;
        this.session.setSessionData(userProfile);
  
        resolve(res.dataObject);
      }, (error) => {
        reject(error.message);
      });
    });
 }

  uploadFile(file: File, filename: string, questionnaireID: number): any {
    //File must be added to a FormData object to be sent to the server
    let formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('filename', filename);
    formData.append('questionnaireID', questionnaireID.toString());

    this.http.post("http://51.11.10.177:3000/api/uploadfile", formData, {
      withCredentials: true,
      responseType: 'text'
    }).subscribe((res: any) => {
      //show status to user
      this.alertService.showSucccess("Importing file. Please go to the 'View Uploaded Responses' section to track progress");
      return res.body;
    }, (error) => {
      //show error to user
      this.alertService.showError("Failed to upload file");
      throw new Error(error.message);
    });
  }
}
