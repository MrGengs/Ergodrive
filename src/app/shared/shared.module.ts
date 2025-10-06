import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { SharedHeaderComponent } from '../components/shared-header/shared-header.component';

@NgModule({
  declarations: [
    SidebarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    SharedHeaderComponent // Import standalone component
  ],
  exports: [
    SidebarComponent,
    SharedHeaderComponent
  ]
})
export class SharedModule { }
