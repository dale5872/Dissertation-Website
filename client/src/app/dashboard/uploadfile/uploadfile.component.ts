import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/_service/http.service';

@Component({
  selector: 'app-uploadfile',
  templateUrl: './uploadfile.component.html',
  styleUrls: ['./uploadfile.component.css']
})
export class UploadfileComponent implements OnInit {
  filename: string;
  selectedFile: File;
  constructor(
    private http: HttpService
  ) { 
  }
  
  ngOnInit() {
    this.filename = "Choose .csv File";
  }

  chooseFileEvent(fileInput: Event) {
    this.selectedFile = (<HTMLInputElement>fileInput.target).files[0];
    this.filename = this.selectedFile.name;
  }

  upload() {
    try {
      this.http.uploadFile(this.selectedFile);
    } catch (error) {
      // @todo : Do some proper error catching here
      console.log(error);
      console.log(error.message);
    }
  }
}
