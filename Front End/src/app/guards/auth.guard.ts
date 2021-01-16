import { UsersService } from './../services/users.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private userSer: UsersService, private router: Router) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
      const localUser = localStorage.getItem('user');
      let verfiyToken: any = {};
      try {
        verfiyToken = decode(localUser);
      } catch {
        verfiyToken = {id: ''};
      }
      const user = await this.userSer.getUserProf().toPromise();
      if (user._id === verfiyToken.id) {
        this.router.navigate(['/']);
        return false;
      } else {
        return true;
      }
    }

}
