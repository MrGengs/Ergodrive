import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WaktuReaksiRemPageRoutingModule } from './waktu-reaksi-rem-routing.module';
import { WaktuReaksiRemPage } from './waktu-reaksi-rem.page';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
    WaktuReaksiRemPageRoutingModule
  ],
  declarations: [WaktuReaksiRemPage]
})
export class WaktuReaksiRemPageModule {}
