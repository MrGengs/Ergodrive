import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-shared-header',
  templateUrl: './shared-header.component.html',
  styleUrls: ['./shared-header.component.scss']
})
export class SharedHeaderComponent {
  @Input() pageTitle: string = '';
  @Input() pageSubtitle: string = '';
  @Input() showSleepTestButton: boolean = false;
  @Input() showStopTestButton: boolean = false;

  @Output() sleepTestClick = new EventEmitter<void>();
  @Output() stopTestClick = new EventEmitter<void>();

  onSleepTestClick() {
    this.sleepTestClick.emit();
  }

  onStopTestClick() {
    this.stopTestClick.emit();
  }
  
  openProfileModal() {
    // Handle profile modal opening logic here
    console.log('Opening profile modal');
  }
}
