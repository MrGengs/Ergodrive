import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BebanKerjaKemudiPageRoutingModule } from './beban-kerja-kemudi-routing.module';
import { BebanKerjaKemudiPage } from './beban-kerja-kemudi.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BebanKerjaKemudiPageRoutingModule,
    SharedModule
  ],
  declarations: [BebanKerjaKemudiPage]
})
export class BebanKerjaKemudiPageModule {}
