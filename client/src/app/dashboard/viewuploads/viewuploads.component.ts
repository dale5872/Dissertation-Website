import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/_service/http.service';
import { SessionService } from 'src/app/_service/session.service';
import { __importDefault } from 'tslib';

@Component({
  selector: 'app-viewuploads',
  templateUrl: './viewuploads.component.html',
  styleUrls: ['./viewuploads.component.css']
})
export class ViewuploadsComponent implements OnInit {

  imports = [];

  constructor(
    private http: HttpService,
    private sessionService: SessionService
  ) { }

  ngOnInit() {
    this.fetchImports()
  }

  async fetchImports() {
    let jsonImports = await this.http.get('api/fetchimports');
    console.log("Fetched DATA");
    this.imports = jsonImports.imports;
  }

}
