import { Router } from '@angular/router';
import { UsersService } from './../services/users.service';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginErr: string;
  svgShow = true;
  paddingStyle = '100px';
  mobScreen = false;

  constructor(public userSer: UsersService,
              private router: Router) { }

  loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ])
  });

  ngOnInit(): void {
    if (this.router.url !== '/login') {
      this.svgShow = false;
      this.paddingStyle = '0';
    }

    if (window.innerWidth <= 768) {
      this.mobScreen = true;
    }
  }

  get f(): {
    [key: string]: AbstractControl;
  } { return this.loginForm.controls; }

  loginSub(): void {
    this.userSer.loginUser({email: this.loginForm.value.email, password: this.loginForm.value.password}).subscribe(res => {
      localStorage.setItem('user', res.jwtSign);
      this.router.navigate(['/']).then(() => {
        location.reload();
      });
    }, err => {
      this.loginErr = err.error;
    });
  }
}
