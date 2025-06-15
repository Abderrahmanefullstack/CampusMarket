import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SigninComponent } from './components/auth/signin/signin.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { AdsComponent } from './components/ads/ads.component';
import { MessagesComponent } from './components/messages/messages.component';
import { AuthGuard } from './guards/auth.guard';
import { NewMessageComponent } from './pages/messages/new-message/new-message.component';

const routes: Routes = [
    { path: '', redirectTo: '/signin', pathMatch: 'full' },
    { path: 'signin', component: SigninComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'ads', component: AdsComponent },
    {
        path: 'messages',
        component: MessagesComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'messages/:postId/:receiverId',
        component: MessagesComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'messages/new',
        component: NewMessageComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
