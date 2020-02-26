import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/_service/http.service';
import { ActivatedRoute } from '@angular/router';
import { compileInjectable, ThrowStmt } from '@angular/compiler';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { BootstrapAlertService } from 'ngx-bootstrap-alert-service';

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
  currentEntityID: number;
  currentEntityClassification: number;

  importInformation: any; //Object can be seen in server/imports.js:92
  similarityData: any; //Object casn be seen in server/analysis.js:91

  constructor(
    private http: HttpService,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private alertService: BootstrapAlertService
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.importID = params['importid'];
      this.questionnaireID = params['questionnaireid'];
    });

    this.http.post('api/fetch/single', {importID: this.importID}).then((value) => {
      this.importInformation = value;
    });

    var questionnaireData = this.http.post('api/fetch/questionnaire', {questionnaireID: this.questionnaireID});
    var responseData = this.http.post('api/fetch/analysis/full', {importID : this.importID});
    var similarityData = this.http.post('api/fetch/analysis/similarities', {importID: this.importID});
    
    var promises = [questionnaireData, responseData, similarityData];
    //var promises = [questionnaireData, responseData , importData];
    
    console.log("Waiting for promises");
    Promise.all(promises).then(values => {
      console.log(values);

      //lets deal with the data as they come in the promises array
      this.questionnaireName = values[0].questionnaireName;
      this.headers = values[0].headers;

      var responses = values[1].imports;


      if(values[2] !== undefined) {
        console.log(values[2]);
        this.similarityData = values[2].imports;
      }

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
    console.log("Changing classification");
    var newClassification = this.currentEntityClassification === 0 ? 1 : 0;
    this.http.post('api/update/classification', {entityID: this.currentEntityID, classification: newClassification}).then(() => {
      this.alertService.showSucccess("Successfully changed classification");
      this.ngOnInit();
    }).catch(() => {
      this.alertService.showError("Failed to change classification");
    });
  }

  async findRawData(entityID: number, currentClassification: number) {
    return new Promise((resolve, reject) => {
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
    this.currentEntityID = entityID;
    this.currentEntityClassification = currentClassification;
    this.currentEntity = await this.findRawData(entityID, currentClassification);
    this.modalService.open(content, {ariaLabelledBy: 'modal-entity-options'});
  }

  openHelpModal(modal) {
    this.modalService.open(modal, {ariaLabelledBy: 'modal-help'});
  }
}