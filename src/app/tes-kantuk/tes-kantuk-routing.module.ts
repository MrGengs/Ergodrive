import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TesKantukPage } from './tes-kantuk.page';

const routes: Routes = [
  {
    path: '',
    component: TesKantukPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TesKantukPageRoutingModule {}
