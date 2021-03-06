import { AuthGuard } from './guards/auth.guard';
import { MessagesComponent } from './messages/messages.component';
import { UserComponent } from './user/user.component';
import { AboutComponent } from './about/about.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'login', component: LoginComponent, canActivate: [AuthGuard]},
  {path: 'signup', component: SignupComponent, canActivate: [AuthGuard]},
  {path: 'about', component: AboutComponent},
  {path: 'user/:id', component: UserComponent},
  {path: 'messages/:id', component: MessagesComponent},
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
