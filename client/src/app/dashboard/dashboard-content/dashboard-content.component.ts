import { Component, OnInit } from '@angular/core';

import { SessionService } from '../../_service/session.service';
import { HttpService } from 'src/app/_service/http.service';

@Component({
  selector: 'app-dashboard-content',
  templateUrl: './dashboard-content.component.html',
  styleUrls: ['./dashboard-content.component.css']
})
export class DashboardContentComponent implements OnInit {
  constructor(
    private session: SessionService,
    private http: HttpService,
  ) { }

  ngOnInit() {
  }

  getUsername() {
    return this.session.getFirstName() + " " + this.session.getLastName();
  }
}
