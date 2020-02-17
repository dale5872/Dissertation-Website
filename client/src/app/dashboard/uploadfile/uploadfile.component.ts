import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/_service/http.service';
import { BootstrapAlertService } from 'ngx-bootstrap-alert-service'
import { FormControl, FormGroup, FormBuilder, FormArray, Form } from '@angular/forms';
import { timingSafeEqual } from 'crypto';
import { CombineLatestSubscriber } from 'rxjs/internal/observable/combineLatest';

@Component({
  selector: 'app-uploadfile',
  templateUrl: './uploadfile.component.html',
  styleUrls: ['./uploadfile.component.css']
})
export class UploadfileComponent implements OnInit {
  filename: string;
  selectedFile: File; 
  uploadInProgress: boolean = false;
  
  uploadFileForm: FormGroup;
  columns: FormArray;
  

  constructor(
    private http: HttpService,
    private alertService: BootstrapAlertService,
    private formBuilder: FormBuilder
  ) { 
    this.uploadFileForm = this.createUploadForm();
  }
  
  ngOnInit() {
    this.filename = "Choose .csv File";
  }

  /**
   * This creates the form builder object for the 
   * Upload Form 
   */
  createUploadForm() {
    return this.formBuilder.group({
      importInfo: this.formBuilder.group({
        importName: ''
      }),
      columns: this.formBuilder.array([this.createColumn()])
    });
  }

  /**
   * Dynamically adds a new 'column' form object to the 
   * FormArray, which also displays the controls to the user
   */
  addColumn() {
    this.columns = this.uploadFileForm.get('columns') as FormArray;
    this.columns.push(this.createColumn());
  }
  
  /**
   * This Creates the FormGroup object for each new column
   */
  createColumn(): FormGroup {
    return this.formBuilder.group({
      columnName: ''
    });
  }
  
  /**
   * Displays the file input dialog box for the user to select 
   * a file
   * @param fileInput Event Object
   */
  chooseFileEvent(fileInput: Event) {
    this.selectedFile = (<HTMLInputElement>fileInput.target).files[0];
    this.filename = this.selectedFile.name;
  }


  startUpload() {
    this.uploadInProgress = true;
  }
  /**
   * Initiates the upload process where the file itself, along with
   * all the user inputed information is sent to the server and stored
   */
  async upload() {
    try {
      const uploadRequest = Object.assign({}, this.uploadFileForm.value);
      const uploadInformation = Object.assign({}, uploadRequest.importInfo);
      const columns = Object.assign({}, uploadRequest.columns);
      var columnArray = Object.keys(columns).map(i => columns[i]);

      console.log(columns);

      var headersArray = [];

      columnArray.forEach((header) => {
        headersArray.push(header.columnName);
      });

      var questionnaireData = {
        questionnaireName: uploadInformation.importName,
        questionnaireHeaders: headersArray
      }

      console.log(questionnaireData);
      var questionnaireID = await this.http.post('api/insert/questionnaire/information', {questionnaireData: JSON.stringify(questionnaireData)});
      this.http.uploadFile(this.selectedFile, this.filename, questionnaireID.value);
    } catch (error) {
      this.alertService.showError(error.message);
    }
  }
}
