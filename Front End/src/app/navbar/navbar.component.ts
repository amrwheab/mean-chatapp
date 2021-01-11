import { MessageService } from './../services/message.service';
import { Subscription } from 'rxjs';
import { FriendList } from './../shared/friendlist';
import { SocketService } from './../services/socket.service';
import { Router } from '@angular/router';
import { UsersService } from './../services/users.service';
import { User } from './../shared/user';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { faUserCircle } from '@fortawesome/free-regular-svg-icons';
import {faHome,
        faUserPlus,
        faSignOutAlt,
        faSearch,
        faSignInAlt,
        faAddressCard,
        faBell,
        faEnvelopeOpenText} from '@fortawesome/free-solid-svg-icons';
import { Socket } from 'ngx-socket-io';
import { FriendRequists } from '../shared/friendreq';
import { MatButton } from '@angular/material/button';
import { Searched } from '../shared/searched';
import { FriendInfo } from '../shared/friendinfo';
import { Message } from '../shared/message';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  animations: [
    trigger('openNav', [
      state('void', style({transform: 'scale(0)'})),
      state('*', style({transform: 'scale(1)'})),
      transition('void => *', [
        animate('.2s')
      ])
    ]),
    trigger('slidemob', [
      state('void', style({transform: 'translate(0,-100%)'})),
      state('*', style({transform: 'translate(0,0)'})),
      transition('* <=> void', [
        animate('.2s')
      ])
    ])
  ]
})
export class NavbarComponent implements OnInit {

  @ViewChild('navbr') navbr: MatButton;
  @ViewChild('overlay') overlay: ElementRef;
  @ViewChild('newMsg') newMsg: MatButton;
  @ViewChild('navname') navname: ElementRef;
  @ViewChild('slidemob') slidemob: ElementRef;

  faHome = faHome;
  faUserPlus = faUserPlus;
  faUserCircle = faUserCircle;
  faSignOutAlt = faSignOutAlt;
  faSearch = faSearch;
  faSignInAlt = faSignInAlt;
  faAddressCard = faAddressCard;
  faBell = faBell;
  faEnvelopeOpenText = faEnvelopeOpenText;

  user: User = {  _id: '',
    name: '',
    email: '',
    address: '',
    gender: '',
    password: '',
    info: '',
    imgUrl: '',
    freindRequists: [],
    freindList: [],
    online: false};

    friendReq: FriendRequists[] = [];
    showNav = false;
    showNewMess = false;
    search = '';
    searchedItems: Searched[] = [];

    friendList: FriendList[] = [];
    friendInfo: FriendInfo[] = [];
    userId: string;
    totalNav = 0;

    mobScreen = false;
    showMobNav = false;

    userOb: Subscription;

  constructor(private userSer: UsersService,
              public router: Router,
              private socketSer: SocketService,
              private socket: Socket,
              private messSer: MessageService) { }

  ngOnInit(): void {
    this.userSer.getUserProf().subscribe((user: User) => {
      this.user = user;

      if (this.user.freindRequists.length > 0) {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this.user.freindRequists.length; i++) {
          this.userSer.getUser(this.user.freindRequists[i]).subscribe((fre: User) => {
            this.friendReq[i] = {
              id: fre._id,
              name: fre.name,
              pic: fre.imgUrl,
              added: true
            };
          });
        }
      }

      this.socket.on(user._id, (nav: FriendRequists) => {
        if (nav.added) {
          this.friendReq.push(nav);
        }else {
          this.friendReq = this.friendReq.filter(ele => ele.id !== nav.id);
        }
      });
      this.socket.on(user._id + 'rejectedFR', (id: string) => {
        this.friendReq = this.friendReq.filter(ele => ele.id !== id);
      });
      this.socket.on(user._id + 'addedFR', (newUser: User) => {
        this.friendReq = this.friendReq.filter(ele => ele.id !== newUser._id);
      });
    });

    this.messageNav();

    if (window.innerWidth <= 768) {
      this.mobScreen = true;
    }

    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        this.mobScreen = true;
      } else {
        this.mobScreen = false;
      }
    });
  }

  messageNav(): void {
    this.userOb = this.messSer.getConversations().subscribe((info: any) => {
      this.friendInfo = info.friendInfo;
      this.userId = info.userId;

      this.friendInfo = this.friendInfo.sort((a, b) => b.lastMSG.time - a.lastMSG.time);

      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.friendInfo.length; i++) {

        // handeling new messages

        this.socket.on(this.userId + 'Msg', (data: Message, id: string) => {
          if (id === this.friendInfo[i].id) {
            const friendMess = this.friendInfo.find(ele => ele.id === id);
            friendMess.lastMSG.msg = data.msg;
            if (!data.seen && data.user !== this.userId) {
              friendMess.notSeenMsg += 1;
            }

            this.friendInfo = this.friendInfo.sort((a, b) => b.lastMSG.time - a.lastMSG.time);
          }
        });

        // handeling seen messages

        this.socket.on(this.userId + 'seenMsg', (id: string) => {
          if (id === this.friendInfo[i].id) {
            const friendMess = this.friendInfo.find(ele => ele.id === id);
            friendMess.notSeenMsg = 0;
          }
        });

        // handeling friend online

        this.socket.on(this.friendInfo[i].friendId + 'friendOnline', (id: string, stat: boolean) => {
          const friendMess = this.friendInfo.find(ele => ele.friendId === id);
          friendMess.online = stat;
        });

      }
    });
  }

  logOut(): void {
    localStorage.removeItem('user');
    this.router.navigate(['/']).then(() => {
      location.reload();
    });
  }

  menuPos(e: number): number {
    if (e === 1) {
      if (this.mobScreen) {
        return this.navbr._elementRef.nativeElement.offsetTop + this.navbr._elementRef.nativeElement.clientHeight + 50;
      }
      return this.navbr._elementRef.nativeElement.offsetTop + this.navbr._elementRef.nativeElement.clientHeight + 5;
    }else {
      if (this.mobScreen) {
        return 0;
      }

      return this.navbr._elementRef.nativeElement.offsetLeft + 9;
    }
  }

  newMsgPos(e: number): number {
    if (e === 1) {
      if (this.mobScreen) {
        return this.newMsg._elementRef.nativeElement.offsetTop + this.newMsg._elementRef.nativeElement.clientHeight + 50;
      }
      return this.newMsg._elementRef.nativeElement.offsetTop + this.newMsg._elementRef.nativeElement.clientHeight + 5;
    }else {
      if (this.mobScreen) {
        return 0;
      }

      return this.newMsg._elementRef.nativeElement.offsetLeft + 9;
    }
  }

  overlayClick(e: Event): void {
    if (e.target === this.overlay.nativeElement) {
      this.showNav = false;
    }
  }

  acceptFriendReq(id: string): void {
    this.socketSer.acceptFriendReq({user1: id, user2: this.user._id});
  }

  rejectFriendReq(id: string): void {
    this.socketSer.rejectFriendReq({user1: id, user2: this.user._id});
  }

  searchForUser(): void {
    if (!this.search) {
      this.searchedItems = [];
    }else {
      this.userSer.searchForUser(this.search).subscribe(users => {
        this.searchedItems = users;
      });
    }
  }
}
