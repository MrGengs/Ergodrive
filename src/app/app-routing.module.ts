import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard'; // Path diperbaiki

const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
    path: 'welcome',
    loadChildren: () => import('./welcome/welcome.module').then( m => m.WelcomePageModule) // Path diperbaiki
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule) // Path diperbaiki
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),
    canActivate: [authGuard]
  },
  {
    path: 'beban-kerja-kemudi',
    loadChildren: () => import('./beban-kerja-kemudi/beban-kerja-kemudi.module').then( m => m.BebanKerjaKemudiPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'beban-kerja-kejadian',
    loadChildren: () => import('./beban-kerja-kejadian/beban-kerja-kejadian.module').then( m => m.BebanKerjaKejadianPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'waktu-reaksi-rem',
    loadChildren: () => import('./waktu-reaksi-rem/waktu-reaksi-rem.module').then( m => m.WaktuReaksiRemPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'waktu-reaksi-kemudi',
    loadChildren: () => import('./waktu-reaksi-kemudi/waktu-reaksi-kemudi.module').then( m => m.WaktuReaksiKemudiPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'tingkat-kantuk',
    loadChildren: () => import('./tingkat-kantuk/tingkat-kantuk.module').then( m => m.TingkatKantukPageModule),
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
