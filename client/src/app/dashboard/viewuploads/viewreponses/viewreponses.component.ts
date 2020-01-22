import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/_service/http.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-viewreponses',
  templateUrl: './viewreponses.component.html',
  styleUrls: ['./viewreponses.component.css']
})
export class ViewreponsesComponent implements OnInit {

  tableData = [];
  importID: number;

  constructor(
    private http: HttpService,
    private activatedRoute: ActivatedRoute
  ) { }

  async ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.importID = params['importid'];
    });

    let responseData = await this.http.post('api/fetch/responses', {importID : this.importID});
    this.tableData = responseData.responses;
  }

}
