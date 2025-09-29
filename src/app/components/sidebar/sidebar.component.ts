import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../auth.service';
import { User } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isVisible = true;
  isCollapsed = true; // Default collapsed saat pertama kali dibuka
  currentRoute: string = '';
  user: User | null = null;
  private userSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private authService: AuthService // <-- Disuntikkan
  ) {}

  ngOnInit() {
    // Subscribe to router events
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });

    // Subscribe to user auth state
    this.userSubscription = this.authService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  isActive(route: string): boolean {
    return this.currentRoute === route;
  }

  // Fungsi logout ditambahkan
  logout() {
    this.authService.logout();
  }

  // Fungsi untuk toggle sidebar
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
