import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {

  email = '';
  password = '';
  isLoading = false;
  showPassword = false;
  rememberMe = false;
  private authSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.checkAuthenticationState();
    this.loadRememberedEmail();
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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private loadRememberedEmail() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.email = rememberedEmail;
      this.rememberMe = true;
    }
  }

  private saveEmailIfRemembered(): void {
    if (this.rememberMe) {
      localStorage.setItem('rememberedEmail', this.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
  }

  async login(): Promise<void> {
    if (!this.email || !this.password) {
      this.showToast('Email dan password tidak boleh kosong', 'warning');
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Memproses login...',
      spinner: 'crescent'
    });
    await loading.present();

    // Save email if Remember Me is checked
    this.saveEmailIfRemembered();

    try {
      await this.authService.loginWithEmail(this.email, this.password);
      this.showToast('Login berhasil!', 'success');
    } catch (error: any) {
      console.error(error);
      this.showAlert('Login Gagal', error.message || 'Terjadi kesalahan saat login');
    } finally {
      this.isLoading = false;
      loading.dismiss();
    }
  }

  async loginWithGoogle(): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Sedang login dengan Google...',
      translucent: true
    });
    await loading.present();

    try {
      this.isLoading = true;
      await this.authService.loginWithGoogle();
      this.showToast('Login dengan Google berhasil!', 'success');
    } catch (error: any) {
      console.error(error);
      if (error.message !== 'Login dibatalkan') {
        this.showAlert('Login Google Gagal', error.message || 'Terjadi kesalahan saat login dengan Google');
      }
    } finally {
      this.isLoading = false;
      loading.dismiss();
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }
}