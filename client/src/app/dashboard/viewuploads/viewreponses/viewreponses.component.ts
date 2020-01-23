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
  headers = [];
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
      var responses = values[1].responses;
      this.questionnaireName = values[0].questionnaireName;
      this.headers = values[0].headers;

      this.populateTable(responses);
      console.log(this.tableData);
    });
  }  

    populateTable(responses) {
      var numOfHeaders = this.headers.length;
      var numOfResponses = responses.length;
      var rows = numOfResponses / numOfHeaders;

      console.log(numOfHeaders);
      console.log(numOfResponses);

      for(var i = 0; i < rows; i++) {
        var row = {
          rowData: []
        };

        for(var c = 0; c < numOfHeaders; c++) {
          row.rowData.push(responses[(i*numOfHeaders) + c]);
        }
        this.tableData.push(row);
      }

      console.log(this.tableData);
    }
}
