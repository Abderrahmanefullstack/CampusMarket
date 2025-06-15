import { Route } from '@angular/router';
import { AdsComponent } from './pages/ads/ads.component';
export const routes: Route[] = [
    {
        path: '', redirectTo: 'ads', pathMatch: 'full'
    },
    {

        path: 'auth',
        loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule)
    },
    {
        path: 'ads',
        loadChildren: () => import('./pages/ads/ads.module').then(m => m.AdsModule)
    },
    {
        path: 'messages',
        loadChildren: () => import('./pages/messages/messages.module').then(m => m.MessagesModule)
    },
    {
        path: 'profile',
        loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule)
    },
    { path: '', redirectTo: 'ads', pathMatch: 'full' }
];