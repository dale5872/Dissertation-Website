import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/_service/http.service';
import { ActivatedRoute } from '@angular/router';
import { compileInjectable, ThrowStmt } from '@angular/compiler';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-full',
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.css']
})
export class FullComponent implements OnInit {

  importID: number;
  questionnaireID: number;  
  questionnaireName: String;
  headers = [];
  tableDataAccepted = [];
  tableDataRejected = [];
  currentEntity;

  constructor(
    private http: HttpService,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.importID = params['importid'];
      this.questionnaireID = params['questionnaireid'];
    });

    let questionnaireData = this.http.post('api/fetch/questionnaire', {questionnaireID: this.questionnaireID});
    let responseData = this.http.post('api/fetch/analysis/full', {importID : this.importID});

    Promise.all([questionnaireData, responseData]).then(values => {
      var responses = values[1].imports; //unsure why its .imports but it works
      this.questionnaireName = values[0].questionnaireName;
      this.headers = values[0].headers;
      //console.log(responses);
      this.populateTable(responses);
    });

  }

  /**
   * Function takes all the raw responses, and pivots the table so
   * we have each response matching the headers instead of a table with each row being
   * the answer to a single question
   * @param responses An array of all the responses
   */
  populateTable(responses) {
    console.log(responses);

    var columns = this.headers.length;
    var numOfResponses = responses.length;

    var dataAccepted = [];
    var dataRejected = [];
    for(var c = 0; c < columns; c++) {
      dataAccepted.push([]);
      dataRejected.push([]);
    }

    for(var i = 0; i < numOfResponses; i++) {
      //find the corresponding header
      var header: String;
      for(var h = 0; h < columns; h++) {
        if(this.headers[h] === responses[i]['rowHeader']) {
          if(responses[i]['classification'] === 0) {
            dataRejected[h].push(responses[i]);
          } else {
            dataAccepted[h].push(responses[i]);
          }
        }
      }
    }

    this.tableDataAccepted = this.pivotTable(dataAccepted, columns);
    this.tableDataRejected = this.pivotTable(dataRejected, columns);
  }

  pivotTable(data, columns) {
    //now we need to pivot the table
    //find the longest column
    var longestColumn = 0;
    var table = []

    for(var i = 0; i < columns; i++) {
      if(data[i].length > longestColumn) {
        longestColumn = data[i].length;
      }
    }

    for(var i = 0; i < longestColumn; i++) {
      var row = {
        rowData: []
      }

      for(var c = 0; c < columns; c++) {
        if(data[c][i] == undefined) {
          row.rowData.push("");
        } else {
          row.rowData.push(data[c][i]);
        }
      }

      table.push(row);
    }

    return table;
  }

  changeClassification() {

  }

  async findRawData(entityID: number, currentClassification: number) {
    return new Promise((resolve, reject) => {
      console.log(this.tableDataAccepted);
      if(currentClassification == 1) {
        //accepted Table
          this.tableDataAccepted.forEach((row) => {
            row.rowData.forEach((entity) => {
              if(entity['entity_id'] === entityID) {
                resolve(entity['rawData']);
              }
            })
          });
      } else {
        //rejected table
        this.tableDataRejected.forEach((row) => {
          row.rowData.forEach((entity) => {
            if(entity['entity_id'] === entityID) {
              resolve(entity['rawData']);
            }
          });
        });
      }

      reject();
    });
  }

  /** HTML Controls */
  async openModal(content, entityID: number, currentClassification: number) {
    this.currentEntity = await this.findRawData(entityID, currentClassification);
    this.modalService.open(content, {ariaLabelledBy: 'modal-entity-options'});
  }
}