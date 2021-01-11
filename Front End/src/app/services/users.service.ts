import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class UsersService {


  private backurl = 'http://localhost:3000';

  constructor(private http: HttpClient, private socket: Socket) {
    this.socket.emit('getConnected' , localStorage.getItem('user'));
  }

  addNewUser(data): Observable<any> {
    return this.http.post(this.backurl + '/users/register', data);
  }

  loginUser(data): Observable<any> {
    return this.http.post(this.backurl + '/users/login', data);
  }

  getUser(id: string): Observable<any> {
    return this.http.get(this.backurl + '/users/getuser/' + id);
  }

  changImg(id: string, file: FormData): Observable<any> {
    return this.http.post(this.backurl + '/users/changeimg', file, {headers: {userId: id}});
  }

  getUserProf(): Observable<any> {
    return this.http.get(this.backurl + '/users/' + localStorage.getItem('user'));
  }

  searchForUser(name: string): Observable<any> {
    return this.http.get(this.backurl + '/users/searchUser/' + name);
  }
}
