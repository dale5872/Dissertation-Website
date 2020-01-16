import { Component, OnInit } from '@angular/core';
import { SessionService } from './_service/session.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isAuthenticated: boolean;
  title = 'client';

  constructor(
    private session: SessionService,
    private router: Router
  ) { }

  ngOnInit() {
    this.session.isLoggedInObservable().subscribe((isAuth) => {
      this.isAuthenticated = isAuth
    });

  }

  logout() {
    this.session.logout();
    this.router.navigateByUrl('/');
  }

  
}
