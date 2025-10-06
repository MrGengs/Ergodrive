import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WaktuReaksiPage } from './waktu-reaksi.page';

const routes: Routes = [
  {
    path: '',
    component: WaktuReaksiPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WaktuReaksiPageModule {}
