import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-tes-kantuk',
  templateUrl: './tes-kantuk.page.html',
  styleUrls: ['./tes-kantuk.page.scss'],
  standalone: false,
})
export class TesKantukPage implements OnInit, OnDestroy {
  
  // Chart data for tes kantuk
  chartData = {
    tingkatKantuk: {
      title: 'Tingkat Kantuk',
      data: [
        { label: 'Pagi (06:00)', value: 15, percentage: 15 },
        { label: 'Siang (12:00)', value: 45, percentage: 45 },
        { label: 'Sore (18:00)', value: 35, percentage: 35 },
        { label: 'Malam (24:00)', value: 75, percentage: 75 }
      ]
    },
    reaksiMata: {
      title: 'Reaksi Mata',
      data: [
        { label: 'Kecepatan Berkedip', value: 82, percentage: 82 },
        { label: 'Durasi Berkedip', value: 68, percentage: 68 },
        { label: 'Frekuensi Menguap', value: 55, percentage: 55 },
        { label: 'Fokus Pandangan', value: 74, percentage: 74 }
      ]
    },
    kinerjaKognitif: {
      title: 'Kinerja Kognitif',
      data: [
        { label: 'Perhatian', value: 78, percentage: 78 },
        { label: 'Memori', value: 85, percentage: 85 },
        { label: 'Kecepatan Proses', value: 72, percentage: 72 },
        { label: 'Pengambilan Keputusan', value: 69, percentage: 69 }
      ]
    },
    kualitasTidur: {
      title: 'Kualitas Tidur',
      data: [
        { label: 'Durasi Tidur', value: 88, percentage: 88 },
        { label: 'Kedalaman Tidur', value: 72, percentage: 72 },
        { label: 'Efisiensi Tidur', value: 85, percentage: 85 },
        { label: 'Waktu Tidur', value: 79, percentage: 79 }
      ]
    }
  };

  // Statistics data
  statistics = {
    totalTests: 89,
    averageSleepiness: 42.5,
    averageReactionTime: 1.8,
    cognitiveScore: 76.2,
    sleepQuality: 81.3,
    improvementRate: 15.2,
    lastTestDate: '2024-01-15',
    testDuration: '10 menit'
  };

  // Sleep patterns data
  sleepPatterns = [
    {
      time: '06:00',
      sleepiness: 15,
      reaction: 0.8,
      cognitive: 95,
      quality: 'excellent'
    },
    {
      time: '12:00',
      sleepiness: 45,
      reaction: 1.5,
      cognitive: 78,
      quality: 'good'
    },
    {
      time: '18:00',
      sleepiness: 35,
      reaction: 1.2,
      cognitive: 85,
      quality: 'good'
    },
    {
      time: '24:00',
      sleepiness: 75,
      reaction: 2.8,
      cognitive: 45,
      quality: 'poor'
    }
  ];

  // Warning levels
  warningLevels = [
    {
      level: 'Aman',
      range: '0-25%',
      color: '#28a745',
      description: 'Kondisi waspada, aman untuk mengemudi',
      icon: 'checkmark-circle-outline'
    },
    {
      level: 'Hati-hati',
      range: '26-50%',
      color: '#ffc107',
      description: 'Mulai mengantuk, pertimbangkan istirahat',
      icon: 'alert-outline'
    },
    {
      level: 'Berbahaya',
      range: '51-75%',
      color: '#fd7e14',
      description: 'Sangat mengantuk, segera berhenti mengemudi',
      icon: 'warning-outline'
    },
    {
      level: 'Kritis',
      range: '76-100%',
      color: '#dc3545',
      description: 'Bahaya tidur di belakang kemudi',
      icon: 'close-circle-outline'
    }
  ];

  // Recent sleep tests
  recentTests = [
    {
      id: 1,
      time: '2 jam yang lalu',
      sleepiness: 38,
      reaction: 1.4,
      cognitive: 82,
      recommendation: 'Aman untuk mengemudi',
      status: 'safe'
    },
    {
      id: 2,
      time: '5 jam yang lalu',
      sleepiness: 62,
      reaction: 2.1,
      cognitive: 58,
      recommendation: 'Istirahat sejenak disarankan',
      status: 'warning'
    },
    {
      id: 3,
      time: '1 hari yang lalu',
      sleepiness: 28,
      reaction: 1.1,
      cognitive: 89,
      recommendation: 'Kondisi baik untuk mengemudi',
      status: 'safe'
    },
    {
      id: 4,
      time: '2 hari yang lalu',
      sleepiness: 78,
      reaction: 3.2,
      cognitive: 42,
      recommendation: 'Tidak disarankan mengemudi',
      status: 'danger'
    }
  ];

  // Sleep recommendations
  recommendations = [
    {
      title: 'Durasi Tidur Ideal',
      description: '7-9 jam tidur per malam untuk performa mengemudi optimal',
      icon: 'bed-outline',
      priority: 'high'
    },
    {
      title: 'Jadwal Tidur Teratur',
      description: 'Tidur dan bangun pada waktu yang sama setiap hari',
      icon: 'calendar-outline',
      priority: 'medium'
    },
    {
      title: 'Hindari Kafein',
      description: 'Batasi konsumsi kafein 6 jam sebelum tidur',
      icon: 'cafe-outline',
      priority: 'medium'
    },
    {
      title: 'Istirahat Cepat',
      description: 'Power nap 15-20 menit dapat meningkatkan kewaspadaan',
      icon: 'time-outline',
      priority: 'high'
    }
  ];

  // Performance trends
  performanceTrends = {
    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    data: [72, 68, 75, 82, 79, 85, 78]
  };

  // Weekly performance data for new chart format
  weeklyPerformanceData = [
    { day: 'Sen', value: 72, score: '72%' },
    { day: 'Sel', value: 68, score: '68%' },
    { day: 'Rab', value: 75, score: '75%' },
    { day: 'Kam', value: 82, score: '82%' },
    { day: 'Jum', value: 79, score: '79%' },
    { day: 'Sab', value: 85, score: '85%' },
    { day: 'Min', value: 78, score: '78%' }
  ];

  // Get highest value for highlighting
  getHighestValue(): number {
    return Math.max(...this.weeklyPerformanceData.map(item => item.value));
  }

  private updateInterval: any;

  constructor() {}

  ngOnInit() {
    this.startRealTimeUpdates();
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  private startRealTimeUpdates() {
    this.updateInterval = setInterval(() => {
      this.updateChartData();
    }, 5000);
  }

  updateChartData() {
    Object.keys(this.chartData).forEach(key => {
      this.chartData[key as keyof typeof this.chartData].data.forEach(item => {
        const variation = Math.random() * 10 - 5;
        item.value = Math.max(0, Math.min(100, item.value + variation));
        item.percentage = item.value;
      });
    });
  }

  getBarColor(value: number): string {
    if (value >= 80) return '#28a745';
    if (value >= 60) return '#ffc107';
    return '#dc3545';
  }

  getSleepinessColor(value: number): string {
    if (value <= 25) return '#28a745';
    if (value <= 50) return '#ffc107';
    if (value <= 75) return '#fd7e14';
    return '#dc3545';
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'safe': return '#28a745';
      case 'warning': return '#ffc107';
      case 'danger': return '#dc3545';
      default: return '#6c757d';
    }
  }

  getPriorityColor(priority: string): string {
    switch(priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  }

  getCurrentSleepinessLevel(): string {
    const currentSleepiness = this.statistics.averageSleepiness;
    if (currentSleepiness <= 25) return 'Aman';
    if (currentSleepiness <= 50) return 'Hati-hati';
    if (currentSleepiness <= 75) return 'Berbahaya';
    return 'Kritis';
  }

  refreshData() {
    this.updateChartData();
  }

  exportData() {
    console.log('Exporting tes kantuk data...');
  }

  startSleepTest() {
    console.log('Starting sleep test...');
  }
}
