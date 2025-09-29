import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BebanKerjaKejadianPage } from './beban-kerja-kejadian.page';

const routes: Routes = [
  {
    path: '',
    component: BebanKerjaKejadianPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BebanKerjaKejadianPageRoutingModule {}
