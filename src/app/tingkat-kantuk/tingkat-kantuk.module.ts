import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TingkatKantukPage } from './tingkat-kantuk.page';

const routes: Routes = [
  {
    path: '',
    component: TingkatKantukPage
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    TingkatKantukPage
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TingkatKantukPageModule {}
