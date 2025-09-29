import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit, OnDestroy {

  private authSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.checkAuthenticationState();
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  private checkAuthenticationState() {
    this.authSubscription = this.authService.user$.subscribe(user => {
      if (user) {
        this.router.navigate(['/home'], { replaceUrl: true });
      }
    });
  }

}
