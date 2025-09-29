import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WaktuReaksiKemudiPage } from './waktu-reaksi-kemudi.page';

const routes: Routes = [
  {
    path: '',
    component: WaktuReaksiKemudiPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WaktuReaksiKemudiPageRoutingModule {}
