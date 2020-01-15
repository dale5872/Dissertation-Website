import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_service/authentication.service';
import { SessionService } from '../_service/session.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';

import { User } from '../_models/user';
import { LoginModel } from '../_models/login';
import { removeSummaryDuplicates } from '@angular/compiler';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {  
  loginForm: FormGroup;

  constructor(
    private authService: AuthenticationService, 
    private session: SessionService,
    private router: Router,
    private formBuilder: FormBuilder
  ) { 
    this.loginForm = this.createForm();
  }

  ngOnInit() {
  }

  createForm() {
    return this.formBuilder.group({
      loginControls: this.formBuilder.group(new LoginModel())
    });
    /**
    return new FormGroup({
      loginControls: new FormGroup({
        username: new FormControl(),
        password: new FormControl()
      })
    });
    */
  }

  clearForm() {
    this.loginForm.reset();
    this.loginForm.reset({
      loginControls: new LoginModel()
    })

  }

  login() {
    //create a copy of the form data (and all subsequent groups) as any
    //changes could affect the form
    const loginRequest = Object.assign({}, this.loginForm.value);
    const loginProfile: LoginModel = Object.assign({}, loginRequest.loginControls);

    console.log(loginProfile.username);

    this.authService.login(loginProfile.username, loginProfile.password).subscribe(
      (profile: User) => {
        console.log(profile);
        localStorage.setItem("JWT", profile.sessionID);
      }
    )

    //reset the form incase of failed attempt
    this.clearForm();
  }

}
