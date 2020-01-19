import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../_models/user';

import { HttpService } from '../_service/http.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isCookieTest = false;
  cookieTestResult = "";

  constructor(
    private http: HttpService
   ) { }

  ngOnInit() {
  }

  cookieTest() {
    this.isCookieTest = true;

    this.http.post('api/auth/userInformation', {});
  }
}
