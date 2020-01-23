import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/_service/http.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {

  importID: number;
  questionnaireID: number;
      
  constructor(
    private http: HttpService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.importID = params['importid'];
      this.questionnaireID = params['questionnaireid'];
    });
  }

  fetchAnalysisData() {
    let questionnaireData = this.http.post('api/fetch/questionnaire', {questionnaireID: this.questionnaireID});
    
    Promise.all([questionnaireData]).then((responses) => {

    });
  }

}
