import { Component, OnInit } from '@angular/core';

import { SessionService } from '../../_service/session.service';
import { HttpService } from 'src/app/_service/http.service';

@Component({
  selector: 'app-dashboard-content',
  templateUrl: './dashboard-content.component.html',
  styleUrls: ['./dashboard-content.component.css']
})
export class DashboardContentComponent implements OnInit {
  grammarBotClientStatus: boolean;
  grammarBotClientStatusData: string;

  constructor(
    private session: SessionService,
    private http: HttpService,
  ) { }

  ngOnInit() {
    this.checkExternalServices();
  }

  getUsername() {
    return this.session.getFirstName() + " " + this.session.getLastName();
  }


  private checkExternalServices() {
    this.http.postURL("http://api.grammarbot.io/v2/check", {
      api_key: "KS9C5N3Y", 
      language: "en-US",
      text:" I can't remember how to go their"}).then(() => {
      this.grammarBotClientStatus = true;
    }).catch((error) => {
      this.grammarBotClientStatus = false;
      this.grammarBotClientStatusData = error;
    });
  }

}
