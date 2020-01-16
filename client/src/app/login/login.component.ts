import { Component, OnInit, ApplicationRef } from '@angular/core';
import { AuthenticationService } from '../_service/authentication.service';
import { SessionService } from '../_service/session.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';

import { User } from '../_models/user';
import { LoginModel } from '../_models/login';
import { removeSummaryDuplicates, ParseSourceFile } from '@angular/compiler';

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
    private formBuilder: FormBuilder,
    private ref: ApplicationRef
  ) { 
    this.loginForm = this.createForm();
  }

  ngOnInit() {
    //check if user is already logged in, if so redirect to the dashboard
    if(this.session.isLoggedIn()) {
      this.router.navigateByUrl('/dashboard');
    }
  }

  /**
   * Creates the data bindings to the form using the LoginModel
   * class
   */
  createForm() {
    return this.formBuilder.group({
      loginControls: this.formBuilder.group(new LoginModel())
    });
  }

  /**
   * Clears the form and re-creates the data bindings
   */
  clearForm() {
    this.loginForm.reset();
    this.loginForm.reset({
      loginControls: new LoginModel()
    })

  }

  /**
   * Sends a request through the authentication service
   * to authenticate the user with the given credentials.
   * If successful, redirects to dashboard
   * If unsuccessful, displays alert (THIS WILL BE CHANGED IN FUTURE)
   */
  login() {
    //create a copy of the form data (and all subsequent groups) as any
    //changes could affect the form
    const loginRequest = Object.assign({}, this.loginForm.value);
    const loginProfile: LoginModel = Object.assign({}, loginRequest.loginControls);

    this.authService.login(loginProfile.username, loginProfile.password).subscribe(
      (profile: User) => {
        if(profile.sessionID) {
          //start the session
          this.session.beginSession(profile);
          
          //redirect to dashboard
          this.router.navigateByUrl('/dashboard');
        }
      }, (error) => {
        alert("Login Credentials are Incorrect");
      }
    )

    //reset the form incase of failed attempt
    this.clearForm();
  }

}
