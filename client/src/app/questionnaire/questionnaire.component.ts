import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../_service/http.service';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { BootstrapAlertService } from 'ngx-bootstrap-alert-service'
import { Title } from '@angular/platform-browser';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.css']
})
export class QuestionnaireComponent implements OnInit {
  questionnaireID: number;
  questionnaireName: string;
  writer: string;
  writerID: string;
  questionData: Array<string>;
  importID: number;

  questionnaire: FormGroup;
  questions: FormArray;

  submitted: boolean = false;

  constructor(
    private http: HttpService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private alertService: BootstrapAlertService,
    private title: Title
    ) { 
      this.questionnaire = this.createQuestionnaireResponseForm();
    }
    
    ngOnInit() {
      this.activatedRoute.params.subscribe(params => {
        this.questionnaireID = params['id'];
      });
      
      
      this.http.post('api/fetch/questionnaire/verify', {
        questionnaireID: this.questionnaireID
      }).then((questionnaireData) => {
        this.writer = questionnaireData.writtenBy;
        this.writerID = questionnaireData.writerID;
        this.questionnaireName = questionnaireData.questionnaireName;
        this.importID = questionnaireData.importID;
        this.title.setTitle(`${this.questionnaireName} | FeedbackHub`);
        
      //get the questions
      this.http.post('api/fetch/questionnaire/questions', {
        questionnaireID: this.questionnaireID
      }).then((questionnaireHeaders) => {
        this.questionData = questionnaireHeaders;
        console.log(this.questionData);
        console.log(this.questionData[0]);

        this.questionData.forEach(() => {
          this.addQuestion();
        })
      });
    }).catch(() => {
      //questionnaire is invalid, so we must redirect to homepage
      this.router.navigateByUrl('/');
    });
  }

  private createQuestionnaireResponseForm(): FormGroup {
    return this.formBuilder.group({
      questions: this.formBuilder.array([])
    });
  }

  private createQuestion(): FormGroup {
    return this.formBuilder.group({
      questionResponse: ''
    });
  }

  private addQuestion(): void {
    this.questions = this.questionnaire.get('questions') as FormArray;
    this.questions.push(this.createQuestion());
  }

  private submitResponse(): void {
    try {
      //get the form data
      const questionnaireGroup = Object.assign({}, this.questionnaire.value);
      const questions = Object.assign({}, questionnaireGroup.questions);

      var responsesArray = Object.keys(questions).map(i => questions[i]).map(question => question.questionResponse);
    
      for(var i = 0; i < responsesArray.length; i++){ 
        responsesArray[i] = responsesArray[i].replace(/[^a-zA-Z0-9 ]/g, "")
      }

      var questionnaireData = {
        questionnaireID: this.questionnaireID,
        responses: responsesArray,
        importID: this.importID,
        writerID: this.writerID
      }

      //commit to database
      this.http.post('api/insert/questionnaire/response', {
        questionnaireData: JSON.stringify(questionnaireData)
      });
      //this.submitted = true;
    } catch(error) {
      this.alertService.showError(error.message);
    }
  }
}
