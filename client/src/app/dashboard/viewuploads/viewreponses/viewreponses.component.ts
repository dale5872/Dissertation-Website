import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/_service/http.service';
import { ActivatedRoute } from '@angular/router';
import { PromiseType } from 'protractor/built/plugins';

@Component({
  selector: 'app-viewreponses',
  templateUrl: './viewreponses.component.html',
  styleUrls: ['./viewreponses.component.css']
})
export class ViewreponsesComponent implements OnInit {

  tableData = [];
  questionnaireName: string;
  questionnaireData: Object;
  importID: number;
  questionnaireID: number;

  constructor(
    private http: HttpService,
    private activatedRoute: ActivatedRoute
  ) { }

  async ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.importID = params['importid'];
      this.questionnaireID = params['questionnaireid'];
    });

    let questionnaireData = this.http.post('api/fetch/questionnaire', {questionnaireID: this.questionnaireID});
    let responseData = this.http.post('api/fetch/responses', {importID : this.importID});

    Promise.all([questionnaireData, responseData]).then(values => {
      this.tableData = values[1].responses;
      this.questionnaireName = values[0].questionnaireName;
      this.questionnaireData = values[0].headers;

      console.log(this.tableData);
      console.log(this.questionnaireName);
      console.log(this.questionnaireData);
    });
  }

}
