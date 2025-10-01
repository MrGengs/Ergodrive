import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WaktuReaksiKemudiPageRoutingModule } from './waktu-reaksi-kemudi-routing.module';
import { WaktuReaksiKemudiPage } from './waktu-reaksi-kemudi.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WaktuReaksiKemudiPageRoutingModule,
    SharedModule
  ],
  declarations: [WaktuReaksiKemudiPage]
})
export class WaktuReaksiKemudiPageModule {}
