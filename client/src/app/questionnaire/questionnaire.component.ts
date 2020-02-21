import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../_service/http.service';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.css']
})
export class QuestionnaireComponent implements OnInit {
  questionnaireID: number;

  constructor(
    private http: HttpService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  async ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.questionnaireID = params['id'];
    });

    var isValidQuestionnaire = await this.http.post('api/fetch/questionnaire/verify', {questionnaireID: this.questionnaireID});

    console.log(isValidQuestionnaire);
    if(isValidQuestionnaire === 0) {
      //route to 404
      this.router.navigateByUrl('/');
    }
  }

}
