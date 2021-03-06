import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/_service/http.service';
import { SessionService } from 'src/app/_service/session.service';
import { __importDefault } from 'tslib';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-viewuploads',
  templateUrl: './viewuploads.component.html',
  styleUrls: ['./viewuploads.component.css']
})
export class ViewuploadsComponent implements OnInit {

  imports: Array<any>;

  constructor(
    private http: HttpService,
    private sessionService: SessionService,
    private router: Router,
    private title: Title
  ) { }

  ngOnInit() {
    this.title.setTitle("View Uploads | FeedbackHub");
    this.fetchImports();
  }

  async fetchImports() {
    this.http.get('api/fetch/imports').then((imports) => {
      this.imports = imports.imports;
    });
  }

  displayable() {
    var regexp = RegExp('/viewuploads/viewresponses/.');
    if(regexp.test(this.router.url)) return false;
    
    return true;
  }

}
