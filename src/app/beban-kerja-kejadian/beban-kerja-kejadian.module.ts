import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BebanKerjaKejadianPageRoutingModule } from './beban-kerja-kejadian-routing.module';
import { BebanKerjaKejadianPage } from './beban-kerja-kejadian.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BebanKerjaKejadianPageRoutingModule,
    SharedModule
  ],
  declarations: [BebanKerjaKejadianPage]
})
export class BebanKerjaKejadianPageModule {}
