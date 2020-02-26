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

  questionnaireURL: string;

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
      questionnaireInfoData: this.formBuilder.group({
        questionnaireName: ''
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

  async createQuestionnaire(): Promise<void> {
    try {
      //lets get the form data
      const questionnaireFormGroup = Object.assign({}, this.questionnaireInfoForm.value);
      const questionnaireInfoData = Object.assign({}, questionnaireFormGroup.questionnaireInfoData);
      const questions = Object.assign({}, questionnaireFormGroup.questions);

      //now we just want to get the questions themselves in an array
      var questionsArray = Object.keys(questions).map(i => questions[i]).map(question => question.questionName);

      var questionnaireData = {
        questionnaireName: questionnaireInfoData.questionnaireName,
        questionnaireHeaders: questionsArray
      }

      //commit to database
      var questionnaireIDRequest = await this.http.post('api/insert/questionnaire/new', {questionnaireData: JSON.stringify(questionnaireData)});
      var questionnaireID = questionnaireIDRequest.value;

      //we now show the link to the user
      this.questionnaireURL = `http://51.11.10.177:4200/questionnaire/${questionnaireID}`;
    } catch(error) {
      this.alertService.showError(error.message);
    }
  }
}
