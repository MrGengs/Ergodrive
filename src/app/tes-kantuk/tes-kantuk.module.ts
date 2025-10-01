import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TesKantukPageRoutingModule } from './tes-kantuk-routing.module';
import { TesKantukPage } from './tes-kantuk.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TesKantukPageRoutingModule,
    SharedModule
  ],
  declarations: [TesKantukPage]
})
export class TesKantukPageModule {}
