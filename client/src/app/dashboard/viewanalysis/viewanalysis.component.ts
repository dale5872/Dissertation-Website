import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/_service/http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-viewanalysis',
  templateUrl: './viewanalysis.component.html',
  styleUrls: ['./viewanalysis.component.css']
})
export class ViewanalysisComponent implements OnInit {

  imports: Array<any>;

  constructor(
    private http: HttpService,
    private router: Router
  ) { }

  ngOnInit() {
    this.fetchImports();
  }

  async fetchImports() {
    this.http.get('api/fetch/imports').then((imports) => {
      this.imports = imports.imports;
    });
  }

  displayable() {
    var regexp = RegExp('/viewanalysis/full/.');
    if(regexp.test(this.router.url)) return false;
    
    return true;
  }

}
