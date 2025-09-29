import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BebanKerjaKemudiPage } from './beban-kerja-kemudi.page';

const routes: Routes = [
  {
    path: '',
    component: BebanKerjaKemudiPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BebanKerjaKemudiPageRoutingModule {}
