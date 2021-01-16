import { state, trigger, style, transition, animate } from '@angular/animations';
import { Subscription } from 'rxjs';
import { MessageService } from './../services/message.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from './../shared/user';
import { UsersService } from './../services/users.service';
import { Component, OnInit, ViewChild, ElementRef, AfterContentChecked, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Message } from '../shared/message';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Socket } from 'ngx-socket-io';
import { faCommentDots } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
  animations: [
    trigger('msgAni', [
      state('void', style({transform: 'translate(300px, -300px)'})),
      state('*', style({transform: 'translate(0, 0)'})),
      transition('* <=> void', [
        animate('.2s')
      ])
    ])
  ]
})
export class MessagesComponent implements OnInit, AfterContentChecked, OnDestroy {

  @ViewChild('msgBox') msgBox: ElementRef;

  faChevronRight = faChevronRight;
  userId = '';
  messsages: Message[] = [];
  userImg: string;
  url: string;
  routerObser: Subscription;
  userObser: Subscription;
  reqFinished = false;
  faCommentDots = faCommentDots;
  slideConvToggle = '0';
  mobScreen = false;
  scrollAccestant = 0;
  loadingNewMsg = false;
  writingNow = false;
  user1 = '';
  user2 = '';

  constructor(private userSer: UsersService,
              private actRouter: ActivatedRoute,
              private router: Router,
              private msgSer: MessageService,
              private socket: Socket,
              private chdr: ChangeDetectorRef) { }


  ngOnInit(): void {

    this.userObser = this.userSer.getUserProf().subscribe((user: User) => {
      this.userId = user._id;
      this.socket.on(this.userId + 'Msg', (data: Message, id: string) => {
        if (id === this.actRouter.snapshot.params.id) {
          this.messsages.push(data);
          if (this.userId !== data.user) {
            this.socket.emit('seenMSG', this.actRouter.snapshot.params.id);
          }
        }
      });

      this.socket.on(this.userId + 'seenMsg', (id: string) => {
        if (id === this.actRouter.snapshot.params.id) {
          this.seeningMsg();
        }
      });

      this.socket.on(this.userId + 'writenow', (id: string) => {
        if (id === this.actRouter.snapshot.params.id) {
          if (!this.writingNow) {
            this.writingNow = true;
            setTimeout(() => {
              this.writingNow = false;
            }, 2000);
          }
        }
      });

      this.initParams();
    });


    if (window.innerWidth <= 768) {
      this.mobScreen = true;
      this.slideConvToggle = '-100%';
    }

    window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
      this.mobScreen = true;
      this.slideConvToggle = '-100%';
    } else {
      this.mobScreen = false;
      this.slideConvToggle = '0';
    }
    });

  }

  ngOnDestroy(): void {
    if (this.routerObser) {
      this.routerObser.unsubscribe();
    }
    if (this.userObser) {
      this.userObser.unsubscribe();
    }
    location.reload();
  }

  ngAfterContentChecked(): void {
    this.userImgFun();
    this.chdr.detectChanges();
  }

  initParams(): void {
    this.routerObser = this.actRouter.params.subscribe((val) => {

      this.userImgFun();
      this.scrollAccestant = 0;

      this.msgSer.getMessages(val.id).subscribe((msg) => {
        this.reqFinished = true;
        this.user1 = msg.user1;
        this.user2 = msg.user2;

        if (msg.user1 === this.userId || msg.user2 === this.userId) {
          this.messsages = msg.msgs;
          if (this.messsages.length > 0) {
            if (this.messsages[this.messsages.length - 1].user !== this.userId) {
              this.socket.emit('seenMSG', val.id);
            }
          }

        } else {
          this.router.navigate(['/']);
        }
      });
    });
  }

  userImgFun(): void {
    try {
      this.userImg = this.msgSer.userInfo.find(ele => ele.id === this.actRouter.snapshot.params.id).imgUrl;
    } catch { }
  }

  seeningMsg(): void {
    this.messsages.forEach(elem => {
      elem.seen = true;
    });
  }

  sendMsg(form: NgForm): void {
    this.socket.emit('sendMsg', { user: this.userId, msg: form.value.msg, msgId: this.actRouter.snapshot.params.id });
    form.reset();
  }

  slideTheConv(): void {
    this.slideConvToggle === '0' ? this.slideConvToggle = '-100%' : this.slideConvToggle = '0';
  }

  scrollMsgBox(): void {
    if (this.msgBox.nativeElement.scrollTop === 0) {
      this.loadingNewMsg = true;
      this.scrollAccestant += 1873;
      this.msgSer.getOlderMessages(this.actRouter.snapshot.params.id, this.messsages[0].time.toString())
      .subscribe((res: Message[]) => {
        this.messsages.unshift(...res);
        this.loadingNewMsg = false;
      });
    }
  }

  sendWriteNow(): void {
    if (this.user1 === this.userId) {
      this.socket.emit('sendwritenow', {user: this.user2, msgUrl: this.actRouter.snapshot.params.id});
    } else {
      this.socket.emit('sendwritenow', {user: this.user1, msgUrl: this.actRouter.snapshot.params.id});
    }
  }

}
