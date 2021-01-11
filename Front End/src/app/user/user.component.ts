import { environment } from './../../environments/environment';
import { SocketService } from './../services/socket.service';
import { FriendRequists } from './../shared/friendreq';
import { User } from './../shared/user';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from './../services/users.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy {

  url: string;

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

  pageErr: string;
  profile = false;
  sentFR = '';
  havesentFRiendReq = '';
  friend = '';
  visitorId = '';

  userOb: Subscription;

  constructor(private userSer: UsersService,
              private router: Router,
              private actRoute: ActivatedRoute,
              private socket: Socket,
              private socketSer: SocketService) { }

  ngOnInit(): void {
    this.actRoute.params.subscribe(val => {
      this.url = this.router.url.slice(6);
      this.userOb = this.userSer.getUser(this.url).subscribe((user: User) => {
        this.user = user;
        this.userSer.getUserProf().subscribe((userCh: User) => {
          this.visitorId = userCh._id;
          if (user._id === userCh._id) {
            this.profile = true;
          }else {
            this.sentFR = user.freindRequists.find(ele => ele === userCh._id );
            this.havesentFRiendReq = userCh.freindRequists.find(ele => ele === user._id);
            const friendCheck = user.freindList.find(ele => ele.userId === userCh._id );
            if (friendCheck) {
              this.friend = friendCheck.userId;
            }
          }
          this.socket.on(userCh._id + 'addedFR', (data: User) => {
              if (this.url === data._id) {
                this.user = data;
                this.friend = data._id;
                this.havesentFRiendReq = '';
                this.sentFR = '';
            }
          });
          this.socket.on(userCh._id + 'rejectedFRSender', () => {
            this.sentFR = '';
          });
          this.socket.on(userCh._id + 'rejectedFR', () => {
            this.havesentFRiendReq = '';
          });
          this.socket.on(userCh._id, (nav: FriendRequists) => {
            if (nav.added && nav.id === this.url) {
              this.havesentFRiendReq = nav.id;
            }else if (!nav.added && nav.id === this.url) {
              this.havesentFRiendReq = '';
            }
        });
        });
      }, err => {
        this.pageErr = err.error;
      });
      this.socket.on('FR', (ele: string) => this.sentFR = ele);
      this.socket.on('cancelFR', () => this.sentFR = '');
    });

  }

  ngOnDestroy(): void {
    this.userOb.unsubscribe();
  }

  changeImg(e: any): void {
    const formData = new FormData();
    const file = e.target.files[0];
    formData.append('file', file);

    this.userSer.changImg(this.user._id, formData).subscribe(res => {
      this.user.imgUrl = environment.backurl + '/assets/' + res.filename;
    });
  }

  addFriendRequist(): void {
    this.socket.emit('addFriend', {visitorId: this.visitorId, userId: this.url});
  }

  cancelFriendRequist(): void {
    this.socket.emit('cancelFriend', {visitorId: this.visitorId, userId: this.url});
  }

  acceptFriendReq(): void {
    this.socketSer.acceptFriendReq({user1: this.havesentFRiendReq, user2: this.visitorId});
  }

  rejectRequist(): void {
    this.socketSer.rejectFriendReq({user1: this.havesentFRiendReq, user2: this.visitorId});
  }

}
