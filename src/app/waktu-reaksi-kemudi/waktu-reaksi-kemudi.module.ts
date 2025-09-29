import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WaktuReaksiKemudiPageRoutingModule } from './waktu-reaksi-kemudi-routing.module';
import { WaktuReaksiKemudiPage } from './waktu-reaksi-kemudi.page';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
    WaktuReaksiKemudiPageRoutingModule
  ],
  declarations: [WaktuReaksiKemudiPage]
})
export class WaktuReaksiKemudiPageModule {}
