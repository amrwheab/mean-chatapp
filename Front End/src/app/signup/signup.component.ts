import { UsersService } from './../services/users.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  errCase: string;
  svgShow = true;
  paddingStyle = '100px';

  mobScreen = false;

  constructor(private userSer: UsersService, private router: Router) { }

  signupForm = new FormGroup({
    name: new FormControl('', [
      Validators.required
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    address: new FormControl('', [
      Validators.required
    ]),
    gender: new FormControl('', [
      Validators.required
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]),
    confirmPassword: new FormControl(''),
    info: new FormControl('')
  }, {
    validators: this.passwordConfirming
  });

  passwordConfirming(c: AbstractControl): { invalid: boolean } {
    if (c.get('password').value !== c.get('confirmPassword').value) {
      return { invalid: true };
    }
  }

  get f(): {
    [key: string]: AbstractControl;
  } {
    return this.signupForm.controls;
  }

  ngOnInit(): void {
    if (this.router.url !== '/signup') {
      this.svgShow = false;
      this.paddingStyle = '0';
    }

    if (window.innerWidth <= 768) {
      this.mobScreen = true;
    }
  }

  signupSub(): void {
    const user = {
      name: this.signupForm.value.name,
      email: this.signupForm.value.email,
      address: this.signupForm.value.address,
      gender: this.signupForm.value.gender,
      password: this.signupForm.value.password,
      info: this.signupForm.value.info
    };
    this.userSer.addNewUser(user).subscribe(res => {
      localStorage.setItem('user', res.jwtSign);
      this.router.navigate(['/']).then(() => {
        location.reload();
      });
    }, err => {
      this.errCase = err.error;
    });
  }

}
