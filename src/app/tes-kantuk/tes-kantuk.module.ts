import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TesKantukPageRoutingModule } from './tes-kantuk-routing.module';
import { TesKantukPage } from './tes-kantuk.page';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
    TesKantukPageRoutingModule
  ],
  declarations: [TesKantukPage]
})
export class TesKantukPageModule {}
