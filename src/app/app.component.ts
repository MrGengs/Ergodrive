import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './auth.service';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from '@angular/fire/auth';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  showSidebar = false;
  private authSubscription: Subscription | undefined;
  private routerSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to authentication state changes
    this.authSubscription = this.authService.user$.subscribe((user: User | null) => {
      this.updateSidebarVisibility(!!user);
    });

    // Check current route on navigation
    this.routerSubscription = this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (event instanceof NavigationEnd) {
        this.checkCurrentRoute(event.url);
      }
    });
  }

  private updateSidebarVisibility(isLoggedIn: boolean) {
    // Hide sidebar on login/register/welcome pages even if user is logged in
    const hideSidebarRoutes = ['/welcome', '/login', '/register'];
    const shouldShowSidebar = isLoggedIn && !hideSidebarRoutes.some(route => 
      this.router.url.startsWith(route)
    );
    
    this.showSidebar = shouldShowSidebar;
  }

  private checkCurrentRoute(url: string) {
    const hideSidebarRoutes = ['/welcome', '/login', '/register'];
    const shouldHideSidebar = hideSidebarRoutes.some(route => url.startsWith(route));
    
    if (shouldHideSidebar) {
      this.showSidebar = false;
    } else {
      // Update based on auth state
      this.authService.user$.subscribe(user => {
        this.updateSidebarVisibility(!!user);
      });
    }
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.authSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }
}
