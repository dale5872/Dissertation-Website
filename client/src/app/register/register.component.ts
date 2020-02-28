import { Component, OnInit } from '@angular/core';
import { SessionService } from '../_service/session.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { RegistrationModel } from '../_models/registration';
import { AuthenticationService } from '../_service/authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registrationForm: FormGroup;

  constructor(
    private authService: AuthenticationService,
    private session: SessionService,
    private router: Router,
    private formBuilder: FormBuilder,
    private title: Title
  ) { 
    this.registrationForm = this.createForm();
  }

  ngOnInit() {
    //check if the user is logged in, if so redirect to dashboard
    if(this.session.isLoggedIn()) {
      this.router.navigateByUrl('/dashboard');
    }
    this.title.setTitle("Register | FeedbackHub");
  }

  /**
   * Creates the data bindings for the form
   */
  createForm() {
    return this.formBuilder.group({
      registerControls: this.formBuilder.group(new RegistrationModel())
    });
  }

  /**
   * Clears the form and re-creates the data bindings
   */
  clearForm() {
    this.registrationForm.reset();
    this.registrationForm.reset({
      registerControls: new RegistrationModel()
    });
  }

  /**
   * Sends a registration request to the server, and if successful redirects the user
   * to the login page. If failed, an error message will be displayed to the user
   */
  register() {
    const registerRequest = Object.assign({}, this.registrationForm.value);
    const registerProfile: RegistrationModel = Object.assign({}, registerRequest.registerControls);

    this.authService.register(registerProfile).subscribe(
      () => {
        this.router.navigateByUrl('/login');
      }, (error) => {
        // @todo: Implement better user notification instead of alerts
        alert("Registration Failed");
      }
    )

    this.clearForm();
  }

}
