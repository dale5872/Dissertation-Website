import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../_models/user';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isCookieTest = false;
  cookieTestResult = "";

  constructor(
    private http: HttpClient
   ) { }

  ngOnInit() {
  }

  cookieTest() {
    this.isCookieTest = true;

    this.http.post('http://51.11.10.177:3000/api/auth/userInformation',{}, {
      withCredentials: true
    }).subscribe((data: any) => { //data: any is NOT recommended, but possible
      console.log(data);
      this.cookieTestResult = `${data.userProfile.username}, ${data.userProfile.fname}, ${data.userProfile.lname}`;
    });

  }

}
