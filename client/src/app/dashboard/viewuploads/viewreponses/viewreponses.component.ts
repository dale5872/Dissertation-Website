import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/_service/http.service';

@Component({
  selector: 'app-viewreponses',
  templateUrl: './viewreponses.component.html',
  styleUrls: ['./viewreponses.component.css']
})
export class ViewreponsesComponent implements OnInit {

  tableData = [];

  constructor(
    private http: HttpService
  ) { }

  async ngOnInit() {
    this.tableData = await this.http.get('api/fetch/responses');
  }

}
