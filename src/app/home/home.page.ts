import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { User } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';

// Interface untuk notifikasi
export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'update' | 'achievement' | 'reminder' | 'security';
  read: boolean;
  date: Date;
}

interface UserInfo {
  name: string;
  initial: string;
  status: string;
  isOnline: boolean;
  email: string;
  phone: string;
  photoURL: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class HomePage implements OnInit, OnDestroy {
  activeMenuItem: string = 'Beban Kerja (Kemudi)';
  userInfo: UserInfo = {
    name: 'Guest',
    initial: 'G',
    status: 'Offline',
    isOnline: false,
    email: '',
    phone: '',
    photoURL: '',
  };

  private userSubscription: any;

  // Chart data for different metrics
  chartData = {
    kecepatanRataRata: {
      title: 'Kecepatan Rata-rata',
      data: [
        { label: 'Tanpa Lalu Lintas', value: 75, percentage: 75 },
        { label: 'Lawan Arah', value: 60, percentage: 60 },
        { label: 'Kendaraan Depan', value: 45, percentage: 45 },
      ],
    },
    sdlp: {
      title: 'SDLP',
      data: [
        { label: 'Tanpa Lalu Lintas', value: 85, percentage: 85 },
        { label: 'Lawan Arah', value: 70, percentage: 70 },
        { label: 'Kendaraan Depan', value: 55, percentage: 55 },
      ],
    },
    waktuReaksiPDT: {
      title: 'Waktu Reaksi PDT',
      data: [
        { label: 'Tanpa Lalu Lintas', value: 40, percentage: 40 },
        { label: 'Lawan Arah', value: 65, percentage: 65 },
        { label: 'Kendaraan Depan', value: 50, percentage: 50 },
      ],
    },
    pdtGagal: {
      title: 'PDT Gagal',
      data: [
        { label: 'Tanpa Lalu Lintas', value: 90, percentage: 90 },
        { label: 'Lawan Arah', value: 95, percentage: 95 },
        { label: 'Kendaraan Depan', value: 88, percentage: 88 },
      ],
    },
  };

  // Menu items for sidebar
  menuItems = [
    {
      id: 'beban-kerja-kemudi',
      label: 'Beban Kerja (Kemudi)',
      icon: 'speedometer-outline',
    },
    {
      id: 'beban-kerja-kejadian',
      label: 'Beban Kerja (Kejadian)',
      icon: 'alert-circle-outline',
    },
    { id: 'tes-kantuk', label: 'Tes Kantuk', icon: 'bed-outline' },
  ];

  // User information will be populated from auth service

  // Edit user information for modal
  editUserInfo = {
    name: 'Guest',
    email: '',
    phone: '',
    status: 'Offline',
  } as {
    name: string;
    email: string;
    phone: string;
    status: string;
  };

  // Modal state
  showProfileModal: boolean = false;

  // Dashboard statistics
  dashboardStats = {
    totalTests: 24,
    completedTests: 18,
    averageScore: 78,
    lastTestDate: '2024-01-15',
    streakDays: 5,
  };

  // Recent activities
  recentActivities = [
    {
      id: 1,
      type: 'test',
      title: 'Tes Beban Kerja Kemudi',
      time: '2 jam yang lalu',
      status: 'completed',
    },
    {
      id: 2,
      type: 'alert',
      title: 'Peringatan Kantuk',
      time: '4 jam yang lalu',
      status: 'warning',
    },
    {
      id: 3,
      type: 'test',
      title: 'Tes Waktu Reaksi',
      time: '1 hari yang lalu',
      status: 'completed',
    },
    {
      id: 4,
      type: 'achievement',
      title: '5 Hari Berturut-turut',
      time: '2 hari yang lalu',
      status: 'success',
    },
  ];

  // Notifications
  notifications: NotificationItem[] = [
    {
      id: 1,
      title: 'Tes Terjadwal',
      message: 'Anda memiliki jadwal tes mengemudi besok pukul 10:00 WIB',
      time: '2 jam yang lalu',
      type: 'info',
      read: false,
      date: new Date()
    },
    {
      id: 2,
      title: 'Pembaruan Aplikasi',
      message: 'Versi terbaru aplikasi ERGODRIVE tersedia. Segera perbarui untuk pengalaman yang lebih baik.',
      time: '5 jam yang lalu',
      type: 'update',
      read: false,
      date: new Date(Date.now() - 5 * 60 * 60 * 1000)
    },
    {
      id: 3,
      title: 'Peringatan Keamanan',
      message: 'Terdeteksi aktivitas tidak biasa pada akun Anda. Mohon periksa keamanan akun.',
      time: '1 hari yang lalu',
      type: 'warning',
      read: true,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: 4,
      title: 'Tes Beban Kerja Kemudi',
      message: 'Tes Beban Kerja Kemudi akan dimulai dalam 1 jam',
      time: '30 menit yang lalu',
      type: 'reminder',
      read: false,
      date: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: 5,
      title: 'Pencapaian',
      message: 'Anda telah menyelesaikan 20 tes!',
      time: '2 jam yang lalu',
      type: 'achievement',
      read: true,
      date: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  ];

  // Performance trends
  performanceTrends = {
    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    data: [65, 72, 68, 75, 80, 78, 82],
  };

  // Weekly performance data for new chart format
  weeklyPerformanceData = [
    { day: 'Sen', value: 65, score: '65%' },
    { day: 'Sel', value: 72, score: '72%' },
    { day: 'Rab', value: 68, score: '68%' },
    { day: 'Kam', value: 75, score: '75%' },
    { day: 'Jum', value: 80, score: '80%' },
    { day: 'Sab', value: 78, score: '78%' },
    { day: 'Min', value: 82, score: '82%' },
  ];

  private updateInterval: any;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    console.log('HomePage initialized, subscribing to auth state...');

    // Subscribe to user authentication state
    this.userSubscription = this.authService.user$
      .pipe(
        tap((user) => console.log('Auth state changed, user:', user)),
        switchMap((user) => {
          if (!user) {
            // No user is logged in
            return of(null);
          }

          // Get additional user data from Firestore
          return this.authService.getUserData(user.uid).pipe(
            tap((userData) =>
              console.log('User data from Firestore:', userData)
            ),
            map((userData) => ({
              authUser: user,
              userData: userData,
            }))
          );
        })
      )
      .subscribe((data: { authUser: any; userData: any } | null) => {
        if (data?.authUser) {
          const { authUser, userData } = data;

          // Use photoURL from Firestore if available, otherwise from auth
          let photoURL = userData?.photoURL || authUser.photoURL || '';

          // Log the original photo URL for debugging
          console.log('Original photo URL:', photoURL);

          // If this is a Google user with a photo URL
          if (photoURL && photoURL.includes('googleusercontent.com')) {
            // Remove any existing size parameters and add our own for consistent sizing
            const baseUrl = photoURL.split('=')[0];
            // Request a higher resolution image (s400) for better quality
            photoURL = `${baseUrl}=s400`;
            console.log('Processed Google photo URL:', photoURL);
          }

          // Set user info
          this.userInfo = {
            name:
              authUser.displayName || authUser.email?.split('@')[0] || 'User',
            initial: this.getUserInitial(authUser),
            status: 'Online',
            isOnline: true,
            email: authUser.email || '',
            phone: authUser.phoneNumber || '',
            photoURL: photoURL,
          };

          console.log('User info set:', this.userInfo);

          // Update edit form with user data
          this.editUserInfo = {
            name: this.userInfo.name,
            email: this.userInfo.email,
            phone: this.userInfo.phone,
            status: this.userInfo.status,
          };
        } else {
          // No user is logged in
          this.userInfo = {
            name: 'Guest',
            initial: 'G',
            status: 'Offline',
            isOnline: false,
            email: '',
            phone: '',
            photoURL: '',
          };
          console.log('No user logged in, using default user info');
        }

        // Save user profile to local storage
        this.saveUserProfile();
      });

    // Load any saved profile data
    this.loadUserProfile();

    // Start real-time data updates
    this.startRealTimeUpdates();
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    // Clean up interval when component is destroyed
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  // Start real-time data updates
  private startRealTimeUpdates() {
    this.updateInterval = setInterval(() => {
      this.updateChartData();
    }, 5000); // Update every 5 seconds
  }

  // Helper method to get user initial from display name or email
  private getUserInitial(user: {
    displayName?: string | null;
    email?: string | null;
  }): string {
    if (user.displayName) {
      // Get first letter of each word in display name
      const names = user.displayName.split(' ');
      if (names.length > 1) {
        return (
          names[0].charAt(0) + names[names.length - 1].charAt(0)
        ).toUpperCase();
      }
      return user.displayName.charAt(0).toUpperCase();
    } else if (user.email) {
      // Use first letter of email if no display name
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  }

  // Handle successful image load
  onImageLoad(event: Event) {
    console.log('Profile image loaded successfully');
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'block';

    // Hide the initial if it's visible
    const avatarContainer = imgElement.closest('.user-avatar');
    if (avatarContainer) {
      const initialElement = avatarContainer.querySelector('.user-initial');
      if (initialElement) {
        (initialElement as HTMLElement).style.display = 'none';
      }
    }
  }

  // Function to check if image is accessible
  private async checkImageAccessibility(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  // Handle image loading errors
  async onImageError(event: any) {
    const imgElement = event.target as HTMLImageElement;
    const avatarContainer = imgElement.closest('.user-avatar');

    if (!avatarContainer) return;

    // Hide the broken image
    imgElement.style.display = 'none';

    // Show user initial as fallback
    this.showUserInitial(avatarContainer);

    // Log the error for debugging
    console.error('Failed to load profile image. Showing fallback initial.');
  }

  // Show user initial as fallback
  private showUserInitial(container: Element) {
    const initialElement = container.querySelector('.user-initial');
    if (initialElement) {
      (initialElement as HTMLElement).style.display = 'flex';
    } else {
      const initialSpan = document.createElement('span');
      initialSpan.className = 'user-initial';
      initialSpan.textContent = this.userInfo.initial || 'U';
      container.appendChild(initialSpan);
    }
    this.saveUserProfile();
  }

  // Method to handle menu item clicks
  selectMenuItem(menuItem: string) {
    this.activeMenuItem = menuItem;

    // Navigate to the appropriate page based on menu item
    switch (menuItem) {
      case 'Beban Kerja (Kemudi)':
        this.router.navigate(['/beban-kerja-kemudi']);
        break;
      case 'Beban Kerja (Kejadian)':
        this.router.navigate(['/beban-kerja-kejadian']);
        break;
      case 'Tes Kantuk':
        this.router.navigate(['/tes-kantuk']);
        break;
      case 'Waktu Reaksi Rem':
        this.router.navigate(['/waktu-reaksi-rem']);
        break;
      case 'Waktu Reaksi Kemudi':
        this.router.navigate(['/waktu-reaksi-kemudi']);
        break;
      default:
        console.log('Selected menu item:', menuItem);
    }
  }

  // Method to get chart data by key
  getChartData(key: string) {
    return this.chartData[key as keyof typeof this.chartData] || null;
  }

  // Method to simulate real-time data updates
  updateChartData() {
    // This would typically come from an API or real-time data source
    Object.keys(this.chartData).forEach((key) => {
      this.chartData[key as keyof typeof this.chartData].data.forEach(
        (item) => {
          // Add some random variation to simulate real-time updates
          const variation = Math.random() * 10 - 5; // -5 to +5
          item.value = Math.max(0, Math.min(100, item.value + variation));
          item.percentage = item.value;
        }
      );
    });
  }

  // Method to get status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return '#28a745';
      case 'warning':
        return '#ffc107';
      case 'success':
        return '#17a2b8';
      case 'error':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }

  // Method to get activity icon
  getActivityIcon(type: string): string {
    switch (type) {
      case 'test':
        return 'checkmark-circle-outline';
      case 'alert':
        return 'alert-circle-outline';
      case 'achievement':
        return 'trophy-outline';
      default:
        return 'information-circle-outline';
    }
  }

  /**
   * Menandai notifikasi sebagai sudah dibaca
   * @param notificationId ID notifikasi yang akan ditandai
   */
  markNotificationAsRead(notificationId: number) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Menandai semua notifikasi sebagai sudah dibaca
   */
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
  }

  /**
   * Menangani klik pada notifikasi
   * @param notification Notifikasi yang diklik
   */
  onNotificationClick(notification: NotificationItem) {
    // Tandai sebagai sudah dibaca saat diklik
    if (!notification.read) {
      this.markNotificationAsRead(notification.id);
    }
    
    // Tambahkan logika tambahan saat notifikasi diklik
    // Misalnya, navigasi ke halaman terkait
    console.log('Notification clicked:', notification);
  }

  /**
   * Memeriksa apakah ada notifikasi yang belum dibaca
   * @returns Boolean yang menandakan apakah ada notifikasi yang belum dibaca
   */
  hasUnreadNotifications(): boolean {
    return this.notifications.some(notification => !notification.read);
  }

  /**
   * Track by function untuk *ngFor
   * @param index Index item
   * @param item Item notifikasi
   * @returns ID unik dari notifikasi
   */
  trackByNotificationId(index: number, item: NotificationItem): number {
    return item.id;
  }

  /**
   * Mendapatkan ikon berdasarkan tipe notifikasi
   * @param type Tipe notifikasi
   * @returns Nama ikon
   */
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'info':
        return 'information-circle-outline';
      case 'warning':
        return 'warning-outline';
      case 'update':
        return 'refresh-outline';
      case 'achievement':
        return 'trophy-outline';
      case 'reminder':
        return 'alarm-outline';
      case 'security':
        return 'shield-checkmark-outline';
      default:
        return 'notifications-outline';
    }
  }

  /**
   * Mendapatkan warna berdasarkan tipe notifikasi
   * @param type Tipe notifikasi
   * @returns Kode warna
   */
  getNotificationColor(type: string): string {
    switch (type) {
      case 'info':
        return '#3b82f6'; // blue-500
      case 'warning':
        return '#f59e0b'; // amber-500
      case 'update':
        return '#8b5cf6'; // violet-500
      case 'achievement':
        return '#10b981'; // emerald-500
      case 'reminder':
        return '#ec4899'; // pink-500
      case 'security':
        return '#ef4444'; // red-500
      default:
        return '#6b7280'; // gray-500
    }
  }

  /**
   * Menentukan warna bilah berdasarkan nilai (0-100)
   * @param value Nilai dari 0-100
   * @returns Kode warna yang sesuai
   */
  getBarColor(value: number): string {
    if (value >= 75) {
      return '#28a745'; // Hijau untuk nilai tinggi
    } else if (value >= 50) {
      return '#ffc107'; // Kuning untuk nilai menengah-tinggi
    } else if (value >= 25) {
      return '#fd7e14'; // Oranye untuk nilai menengah-rendah
    } else {
      return '#dc3545'; // Merah untuk nilai rendah
    }
  }

  /**
   * Mendapatkan jumlah notifikasi yang belum dibaca
   * @returns Jumlah notifikasi yang belum dibaca
   */
  getUnreadNotificationsCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  // Method to refresh data
  refreshData() {
    this.updateChartData();
    console.log('Data refreshed');
  }

  // Method to export data
  exportData() {
    console.log('Exporting data...');
    // Implementation for data export
  }

  // Method to get performance status
  getPerformanceStatus(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  }

  // Method to calculate progress percentage
  getProgressPercentage(): number {
    return (
      (this.dashboardStats.completedTests / this.dashboardStats.totalTests) *
      100
    );
  }

  // Profile modal methods
  openProfileModal() {
    // Load current user info into edit form
    this.editUserInfo = {
      name: this.userInfo.name,
      email: this.userInfo.email || '',
      phone: this.userInfo.phone || '',
      status: this.userInfo.status,
    };
    this.showProfileModal = true;
  }

  closeProfileModal() {
    this.showProfileModal = false;
  }

  saveProfile() {
    // Update user info with edited data
    this.userInfo.name = this.editUserInfo.name;
    this.userInfo.email = this.editUserInfo.email;
    this.userInfo.phone = this.editUserInfo.phone;
    this.userInfo.status = this.editUserInfo.status;
    this.userInfo.initial = this.editUserInfo.name.charAt(0).toUpperCase();
    this.userInfo.isOnline = this.editUserInfo.status === 'Online';

    // Save to localStorage
    this.saveUserProfile();

    // Close modal
    this.closeProfileModal();

    console.log('Profile saved:', this.userInfo);
  }

  changeAvatar() {
    // For now, just generate a random initial
    const names = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
    ];
    const randomInitial = names[Math.floor(Math.random() * names.length)];
    this.userInfo.initial = randomInitial;
    this.editUserInfo.name = this.editUserInfo.name; // Keep the name but update initial

    console.log('Avatar changed to:', randomInitial);
  }

  private saveUserProfile() {
    // Save user profile to localStorage
    try {
      if (this.userInfo) {
        localStorage.setItem(
          'ergodriveUserProfile',
          JSON.stringify(this.userInfo)
        );
        console.log('User profile saved to localStorage');
      }
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  private loadUserProfile() {
    // Load user profile from localStorage
    try {
      const savedProfile = localStorage.getItem('ergodriveUserProfile');
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        this.userInfo = { ...this.userInfo, ...profileData };
        console.log('User profile loaded from localStorage:', this.userInfo);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }
}
