import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BebanKerjaPage } from './beban-kerja.page';

const routes: Routes = [
  {
    path: '',
    component: BebanKerjaPage
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    BebanKerjaPage
  ],
  exports: [RouterModule]
})
export class BebanKerjaPageModule {}
