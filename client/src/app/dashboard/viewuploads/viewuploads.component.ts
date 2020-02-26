import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/_service/http.service';
import { SessionService } from 'src/app/_service/session.service';
import { __importDefault } from 'tslib';
import { Router } from '@angular/router';

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
    private router: Router
  ) { }

  ngOnInit() {
    this.fetchImports()
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
