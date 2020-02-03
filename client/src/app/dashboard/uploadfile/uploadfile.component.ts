import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/_service/http.service';
import { BootstrapAlertService } from 'ngx-bootstrap-alert-service'

@Component({
  selector: 'app-uploadfile',
  templateUrl: './uploadfile.component.html',
  styleUrls: ['./uploadfile.component.css']
})
export class UploadfileComponent implements OnInit {
  filename: string;
  selectedFile: File;
  constructor(
    private http: HttpService,
    private alertService: BootstrapAlertService
  ) { 
  }
  
  ngOnInit() {
    this.filename = "Choose .csv File";
  }

  chooseFileEvent(fileInput: Event) {
    this.selectedFile = (<HTMLInputElement>fileInput.target).files[0];
    this.filename = this.selectedFile.name;
  }

  async upload() {
    try {
      var questionnaireData = {
        questionnaireName: 'SSC',
        questionnaireHeaders: ['Stop', 'Start', 'Continue']
      }
      var questionnaireID = await this.http.post('api/insert/questionnaire', {questionnaireData: JSON.stringify(questionnaireData)});
      console.log(questionnaireID.value);
      this.http.uploadFile(this.selectedFile, this.filename, questionnaireID.value);
    } catch (error) {
      this.alertService.showError(error.message);
    }
  }
}
