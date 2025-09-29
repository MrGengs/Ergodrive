import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit, OnDestroy {

  email = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  acceptTerms = false;
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

  async registerWithGoogle() {
    this.isLoading = true;
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Google registration error:', error);
      const alert = await this.alertController.create({
        header: 'Registrasi Gagal',
        message: 'Terjadi kesalahan saat melakukan registrasi dengan Google. Silakan coba lagi.',
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      this.isLoading = false;
    }
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async register() {
    if (!this.email || !this.password || !this.confirmPassword) {
      this.showToast('Semua field harus diisi', 'warning');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showToast('Password tidak sama', 'warning');
      return;
    }

    if (this.password.length < 6) {
      this.showToast('Password minimal 6 karakter', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Sedang mendaftar...',
      translucent: true
    });
    await loading.present();

    try {
      this.isLoading = true;
      await this.authService.registerWithEmail(this.email, this.password);
      this.showToast('Pendaftaran berhasil!', 'success');
    } catch (error: any) {
      console.error(error);
      this.showAlert('Pendaftaran Gagal', error.message || 'Terjadi kesalahan saat mendaftar');
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