import { Component, OnInit } from '@angular/core';
import { SessionService } from '../_service/session.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

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
    private formBuilder: FormBuilder
  ) { 
    this.registrationForm = this.createForm();
  }

  ngOnInit() {
    if(this.session.isLoggedIn()) {
      this.router.navigateByUrl('/dashboard');
    }
  }

  createForm() {
    return this.formBuilder.group({
      registerControls: this.formBuilder.group(new RegistrationModel())
    });
  }

  clearForm() {
    this.registrationForm.reset();
    this.registrationForm.reset({
      registerControls: new RegistrationModel()
    });
  }

  register() {
    const registerRequest = Object.assign({}, this.registrationForm.value);
    const registerProfile: RegistrationModel = Object.assign({}, registerRequest.registerControls);

    this.authService.register(registerProfile).subscribe(
      () => {
        this.router.navigateByUrl('/login');
      }, (error) => {
        alert("Registration Failed");
      }
    )

    this.clearForm();
  }

}
