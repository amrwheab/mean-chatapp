import { UsersService } from './users.service';
import { Injectable, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(private socket: Socket, private userSer: UsersService) {
  }

  acceptFriendReq(data: object): void {
    this.socket.emit('acceptFriendReq', data);
  }

  rejectFriendReq(data: object): void {
    this.socket.emit('rejectFriendReq', data);
  }
}
