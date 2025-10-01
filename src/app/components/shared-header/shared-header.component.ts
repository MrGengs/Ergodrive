import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-shared-header',
  templateUrl: './shared-header.component.html',
  styleUrls: ['./shared-header.component.scss']
})
export class SharedHeaderComponent {
  @Input() pageTitle: string = '';
  @Input() pageSubtitle: string = '';
  
  openProfileModal() {
    // Handle profile modal opening logic here
    console.log('Opening profile modal');
  }
}
