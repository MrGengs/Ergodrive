import { Component, OnInit, OnDestroy } from '@angular/core';


@Component({
  selector: 'app-waktu-reaksi-rem',
  templateUrl: './waktu-reaksi-rem.page.html',
  styleUrls: ['./waktu-reaksi-rem.page.scss'],
  standalone: false,
})
export class WaktuReaksiRemPage implements OnInit, OnDestroy {
  
  // Chart data for waktu reaksi rem
  chartData = {
    waktuReaksiRataRata: {
      title: 'Waktu Reaksi Rata-rata',
      data: [
        { label: 'Kondisi Normal', value: 0.8, percentage: 80 },
        { label: 'Sedang Mengantuk', value: 1.2, percentage: 60 },
        { label: 'Sangat Mengantuk', value: 2.1, percentage: 30 },
        { label: 'Terdistraksi', value: 1.8, percentage: 40 }
      ]
    },
    jarakPengereman: {
      title: 'Jarak Pengereman',
      data: [
        { label: '60 km/jam', value: 18, percentage: 75 },
        { label: '80 km/jam', value: 32, percentage: 65 },
        { label: '100 km/jam', value: 50, percentage: 55 },
        { label: '120 km/jam', value: 72, percentage: 45 }
      ]
    },
    akurasiReaksi: {
      title: 'Akurasi Reaksi',
      data: [
        { label: 'Target Tetap', value: 95, percentage: 95 },
        { label: 'Target Bergerak', value: 82, percentage: 82 },
        { label: 'Kondisi Gelap', value: 78, percentage: 78 },
        { label: 'Kondisi Hujan', value: 71, percentage: 71 }
      ]
    },
    tekananRem: {
      title: 'Tekanan Rem',
      data: [
        { label: 'Rem Darurat', value: 88, percentage: 88 },
        { label: 'Rem Normal', value: 92, percentage: 92 },
        { label: 'Rem Bertahap', value: 85, percentage: 85 },
        { label: 'Rem Halus', value: 79, percentage: 79 }
      ]
    }
  };

  // Statistics data
  statistics = {
    totalTests: 234,
    averageReactionTime: 1.15,
    bestReactionTime: 0.65,
    worstReactionTime: 2.8,
    improvementRate: 12.8,
    accuracyRate: 86.5,
    lastTestDate: '2024-01-15',
    testDuration: '8 menit'
  };

  // Speed analysis data
  speedAnalysis = [
    {
      speed: '30 km/jam',
      reactionTime: 0.6,
      brakingDistance: 4.5,
      totalDistance: 8.2,
      safetyLevel: 'excellent'
    },
    {
      speed: '60 km/jam',
      reactionTime: 0.8,
      brakingDistance: 18.0,
      totalDistance: 31.6,
      safetyLevel: 'good'
    },
    {
      speed: '90 km/jam',
      reactionTime: 1.0,
      brakingDistance: 40.5,
      totalDistance: 71.0,
      safetyLevel: 'average'
    },
    {
      speed: '120 km/jam',
      reactionTime: 1.2,
      brakingDistance: 72.0,
      totalDistance: 126.2,
      safetyLevel: 'poor'
    }
  ];

  // Reaction time factors
  reactionFactors = [
    {
      factor: 'Usia',
      impact: 'Tinggi',
      description: 'Waktu reaksi meningkat seiring bertambahnya usia',
      icon: 'person-outline',
      color: '#ff6b6b'
    },
    {
      factor: 'Kelelahan',
      impact: 'Sangat Tinggi',
      description: 'Kelelahan dapat meningkatkan waktu reaksi hingga 2x',
      icon: 'bed-outline',
      color: '#ff4757'
    },
    {
      factor: 'Distractions',
      impact: 'Tinggi',
      description: 'Penggunaan ponsel dapat meningkatkan waktu reaksi 3x',
      icon: 'phone-portrait-outline',
      color: '#ff6b6b'
    },
    {
      factor: 'Kondisi Cuaca',
      impact: 'Sedang',
      description: 'Hujan atau kabut dapat mempengaruhi visibilitas dan reaksi',
      icon: 'cloud-outline',
      color: '#ffa502'
    }
  ];

  // Recent brake tests
  recentTests = [
    {
      id: 1,
      time: '1 jam yang lalu',
      reactionTime: 0.9,
      speed: 80,
      distance: 28,
      accuracy: 88,
      status: 'good'
    },
    {
      id: 2,
      time: '3 jam yang lalu',
      reactionTime: 1.4,
      speed: 100,
      distance: 52,
      accuracy: 76,
      status: 'average'
    },
    {
      id: 3,
      time: '6 jam yang lalu',
      reactionTime: 0.7,
      speed: 60,
      distance: 16,
      accuracy: 94,
      status: 'excellent'
    },
    {
      id: 4,
      time: '1 hari yang lalu',
      reactionTime: 2.1,
      speed: 120,
      distance: 78,
      accuracy: 65,
      status: 'poor'
    }
  ];

  // Safety recommendations
  safetyRecommendations = [
    {
      title: 'Jaga Jarak Aman',
      description: 'Selalu jaga jarak 3 detik dari kendaraan di depan',
      icon: 'car-outline',
      priority: 'high'
    },
    {
      title: 'Hindari Distractions',
      description: 'Jangan gunakan ponsel saat mengemudi',
      icon: 'phone-portrait-outline',
      priority: 'high'
    },
    {
      title: 'Istirahat Cukup',
      description: 'Berhenti sejenak setiap 2 jam mengemudi',
      icon: 'bed-outline',
      priority: 'medium'
    },
    {
      title: 'Periksa Rem',
      description: 'Rutin periksa kondisi sistem rem kendaraan',
      icon: 'construct-outline',
      priority: 'medium'
    }
  ];

  // Performance trends
  performanceTrends = {
    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    data: [78, 82, 75, 88, 85, 90, 86]
  };

  // Weekly performance data for new chart format
  weeklyPerformanceData = [
    { day: 'Sen', value: 78, score: '78%' },
    { day: 'Sel', value: 82, score: '82%' },
    { day: 'Rab', value: 75, score: '75%' },
    { day: 'Kam', value: 88, score: '88%' },
    { day: 'Jum', value: 85, score: '85%' },
    { day: 'Sab', value: 90, score: '90%' },
    { day: 'Min', value: 86, score: '86%' }
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
        const variation = Math.random() * 0.2 - 0.1;
        item.value = Math.max(0, item.value + variation);
        item.percentage = Math.max(0, Math.min(100, item.percentage + (variation * 10)));
      });
    });
  }

  getBarColor(value: number): string {
    if (value >= 80) return '#28a745';
    if (value >= 60) return '#ffc107';
    return '#dc3545';
  }

  getReactionTimeColor(time: number): string {
    if (time <= 0.8) return '#28a745';
    if (time <= 1.2) return '#ffc107';
    if (time <= 1.8) return '#fd7e14';
    return '#dc3545';
  }

  getSafetyColor(level: string): string {
    switch(level) {
      case 'excellent': return '#28a745';
      case 'good': return '#17a2b8';
      case 'average': return '#ffc107';
      case 'poor': return '#fd7e14';
      default: return '#6c757d';
    }
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'excellent': return '#28a745';
      case 'good': return '#17a2b8';
      case 'average': return '#ffc107';
      case 'poor': return '#fd7e14';
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

  getSafetyLevel(level: string): string {
    switch(level) {
      case 'excellent': return 'Sempurna';
      case 'good': return 'Baik';
      case 'average': return 'Cukup';
      case 'poor': return 'Buruk';
      default: return 'Tidak Diketahui';
    }
  }

  refreshData() {
    this.updateChartData();
  }

  exportData() {
    console.log('Exporting waktu reaksi rem data...');
  }

  startBrakeTest() {
    console.log('Starting brake reaction test...');
  }

  calculateStoppingDistance(speed: number, reactionTime: number): number {
    const speedMs = speed / 3.6; // Convert km/h to m/s
    const reactionDistance = speedMs * reactionTime;
    const brakingDistance = (speedMs * speedMs) / (2 * 9.8); // Simplified braking distance
    return Math.round(reactionDistance + brakingDistance);
  }

  formatDecimal(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
