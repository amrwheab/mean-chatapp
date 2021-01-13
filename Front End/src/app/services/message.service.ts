import { environment } from './../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FriendInfo } from '../shared/friendinfo';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  userInfo: FriendInfo[] = [];

  private backurl = environment.backurl;

  constructor(private http: HttpClient) { }

  getConversations(): Observable<any> {
    return this.http.get(this.backurl + '/msg/getconv/' + localStorage.getItem('user'));
  }

  getMessages(id: string): Observable<any> {
    return this.http.get(this.backurl + '/msg/getmsg/' + id);
  }

  getOlderMessages(id: string, msgId: string): Observable<any> {
    return this.http.get(this.backurl + '/msg/getoldermessages/' + id, {
      params: {
        msgId
    }
    });
  }
}
