import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WaktuReaksiRemPage } from './waktu-reaksi-rem.page';

const routes: Routes = [
  {
    path: '',
    component: WaktuReaksiRemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WaktuReaksiRemPageRoutingModule {}
