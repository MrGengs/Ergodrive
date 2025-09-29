import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private sidebarVisibility = new BehaviorSubject<boolean>(false);
  sidebarVisibility$ = this.sidebarVisibility.asObservable();

  constructor() {}

  setVisibility(visible: boolean) {
    this.sidebarVisibility.next(visible);
  }

  getVisibility() {
    return this.sidebarVisibility.value;
  }
}
