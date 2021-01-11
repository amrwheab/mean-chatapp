import { Subscription } from 'rxjs';
import { UsersService } from './../services/users.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { faCommentDots } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('fade', [
      state('void', style({ opacity: 0 })),
      transition('* <=> void', [
        animate('.2s')
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy {

  @ViewChild('popUp') popUp: ElementRef;

  loginPop = false;
  signUpPop = false;
  popUpShow = false;

  userId: string;

  userOb: Subscription;
  checkUser = false;
  mobScreen = false;
  slideConvToggle = '0';
  faCommentDots = faCommentDots;
  constructor(private userSer: UsersService) { }

  ngOnInit(): void {

    this.userOb = this.userSer.getUserProf().subscribe(user => {
      if (user) {
        this.userId = user._id;
      }
      this.checkUser = true;
    }, (err) => {
      console.log(err);
      this.checkUser = true;
    });

    window.addEventListener('click', (e) => {
      if (this.popUpShow) {
        if (e.target === this.popUp.nativeElement) {
          this.loginPop = false;
          this.signUpPop = false;
          this.popUpShow = false;
        }
      }
    });

    if (window.innerWidth <= 768) {
      this.mobScreen = true;
      this.slideConvToggle = '-100%';
    }

  }

  ngOnDestroy(): void {
    this.userOb.unsubscribe();
  }

  popUpFun(x: number): void {
    if (x === 1) {
      this.loginPop = true;
    }else {
      this.signUpPop = true;
    }
    this.popUpShow = true;
  }

  slideTheConv(): void {
    this.slideConvToggle === '0' ? this.slideConvToggle = '-100%' : this.slideConvToggle = '0';
  }
}
