import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/_service/http.service';
import { BootstrapAlertService } from 'ngx-bootstrap-alert-service'
import { FormControl, FormGroup, FormBuilder, FormArray, Form } from '@angular/forms';


@Component({
  selector: 'app-create-questionnaire',
  templateUrl: './create-questionnaire.component.html',
  styleUrls: ['./create-questionnaire.component.css']
})
export class CreateQuestionnaireComponent implements OnInit {
  questionnaireInfoForm: FormGroup;
  questions: FormArray;

  constructor(    
    private http: HttpService,
    private alertService: BootstrapAlertService,
    private formBuilder: FormBuilder
  ) {
    this.questionnaireInfoForm = this.createQuestionnaireForm();
   }

  ngOnInit() {

  }

  private createQuestionnaireForm(): FormGroup {
    return this.formBuilder.group({
      questionnaireInfo: this.formBuilder.group({
        questionnaireInfoData: ''
      }),
      questions: this.formBuilder.array([this.createQuestion()])
    });
  }

  private createQuestion(): FormGroup {
    return this.formBuilder.group({
      questionName: ''
    });
  }

  private addQuestion(): void {
    this.questions = this.questionnaireInfoForm.get('questions') as FormArray;
    this.questions.push(this.createQuestion());
  }
}
