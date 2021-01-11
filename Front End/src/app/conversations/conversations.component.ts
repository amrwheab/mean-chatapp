import { trigger, state, style, transition, animate } from '@angular/animations';
import { MessageService } from './../services/message.service';
import { Router } from '@angular/router';
import { FriendInfo } from './../shared/friendinfo';
import { Component, OnDestroy, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { Message } from '../shared/message';

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.scss'],
  animations: [
    trigger('fade', [
      state('void', style({opacity: 0})),
      state('*', style({opacity: 1})),
      transition('void <=> *', [
        animate('.3s')
      ])
    ])
  ]
})
export class ConversationsComponent implements OnInit, OnDestroy {

  friendInfo: FriendInfo[] = [];
  sortingConv: FriendInfo[] = [];
  userId: string;
  positionConv = [];
  posotionNum = 0;
  positionState = 'absolute';

  conversationDown = false;

  userOb: Subscription;
  mobScreen = false;


  constructor(public router: Router,
              private socket: Socket,
              private messSer: MessageService) { }

  ngOnInit(): void {

    this.userOb = this.messSer.getConversations().subscribe((info: any) => {
      this.friendInfo = info.friendInfo;
      this.conversationDown = true;
      this.userId = info.userId;

      this.friendInfo = this.friendInfo.sort((a, b) => b.lastMSG.time - a.lastMSG.time);
      this.messSer.userInfo = this.friendInfo;

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

            const oldPos = this.positionConv.find(ele => ele.msgId === id).pos;
            this.positionConv.forEach(elem => {
              if (elem.pos < oldPos) {
                elem.pos += 75;
              } else if (elem.pos === oldPos) {
                elem.pos = 75;
              }
            });
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

        // arrange messages
        this.posotionNum += 75;
        this.positionConv.push({msgId: this.friendInfo[i].id, pos: this.posotionNum});

      }
    });

    if (window.innerWidth <= 768) {
      this.mobScreen = true;
    }
  }

  ngOnDestroy(): void {
    if (this.userOb) {
      this.userOb.unsubscribe();
    }
  }

  arrangElem(id: string): number {
    return this.positionConv.find(ele => ele.msgId === id).pos;
  }

  searchConv(val: string): void {
    val ? this.positionState = 'static' : this.positionState = 'absolute';
    this.friendInfo = this.messSer.userInfo.filter(ele => ele.name.includes(val) );
  }

}
