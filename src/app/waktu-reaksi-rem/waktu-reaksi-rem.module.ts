import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WaktuReaksiRemPageRoutingModule } from './waktu-reaksi-rem-routing.module';
import { WaktuReaksiRemPage } from './waktu-reaksi-rem.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WaktuReaksiRemPageRoutingModule,
    SharedModule
  ],
  declarations: [WaktuReaksiRemPage]
})
export class WaktuReaksiRemPageModule {}
