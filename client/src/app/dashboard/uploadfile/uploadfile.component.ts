import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/_service/http.service';
import { BootstrapAlertService } from 'ngx-bootstrap-alert-service'
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-uploadfile',
  templateUrl: './uploadfile.component.html',
  styleUrls: ['./uploadfile.component.css']
})
export class UploadfileComponent implements OnInit {
  filename: string;
  selectedFile: File; 
  uploadInProgress: boolean = false;
  userQuestionnaires: any;
  
  uploadFileForm: FormGroup;
  columns: FormArray;
  selectedQuestionnaire;
  

  constructor(
    private http: HttpService,
    private alertService: BootstrapAlertService,
    private formBuilder: FormBuilder,
    private title: Title
  ) { 
    this.uploadFileForm = this.createUploadForm();
  }
  
  async ngOnInit() {
    this.title.setTitle("Upload Questionnaire | FeedbackHub");
    this.userQuestionnaires = {
      imports: undefined
    };
    this.filename = "Choose .csv File";

    //this.userQuestionnaires = await this.http.get("api/fetch/questionnaire/all");
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

  selected() {
    console.log(this.selectedQuestionnaire);
  }

  /**
   * Initiates the upload process where the file itself, along with
   * all the user inputed information is sent to the server and stored
   */
  async upload() {
    try {
      var questionnaireID: number;

      if(this.selectedQuestionnaire !== undefined) {
        questionnaireID = this.selectedQuestionnaire;
      } else {
        const uploadRequest = Object.assign({}, this.uploadFileForm.value);
        const uploadInformation = Object.assign({}, uploadRequest.importInfo);
        const columns = Object.assign({}, uploadRequest.columns);
        var columnArray = Object.keys(columns).map(i => columns[i]);
    
        var headersArray = [];
  
        //now we collate all the column headers in a single array
        // (not wrapped in other objects)
        columnArray.forEach((header) => {
          headersArray.push(header.columnName);
        });
  
        var questionnaireData = {
          questionnaireName: uploadInformation.importName,
          questionnaireHeaders: headersArray
        }
  
        var questionnaireIDRequest = await this.http.post('api/insert/questionnaire/information', {questionnaireData: JSON.stringify(questionnaireData)});
        questionnaireID = questionnaireIDRequest.value;
      }
      console.log(questionnaireID);
      this.http.uploadFile(this.selectedFile, this.filename, questionnaireID);
    } catch (error) {
      this.alertService.showError(error.message);
    }
  }
}
