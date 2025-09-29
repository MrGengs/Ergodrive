import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-waktu-reaksi-kemudi',
  templateUrl: './waktu-reaksi-kemudi.page.html',
  styleUrls: ['./waktu-reaksi-kemudi.page.scss'],
  standalone: false,
})
export class WaktuReaksiKemudiPage implements OnInit, OnDestroy {
  // Chart data for waktu reaksi kemudi
  chartData = {
    waktuReaksiSteering: {
      title: 'Waktu Reaksi Kemudi',
      data: [
        { label: 'Belok Kiri', value: 0.6, percentage: 85 },
        { label: 'Belok Kanan', value: 0.65, percentage: 80 },
        { label: 'Menghindar', value: 0.8, percentage: 75 },
        { label: 'Koreksi Lajur', value: 0.4, percentage: 90 },
      ],
    },
    presisiKemudi: {
      title: 'Presisi Kemudi',
      data: [
        { label: 'Lurus', value: 94, percentage: 94 },
        { label: 'Belok Halus', value: 87, percentage: 87 },
        { label: 'Belok Tajam', value: 76, percentage: 76 },
        { label: 'Manuver Cepat', value: 68, percentage: 68 },
      ],
    },
    stabilitasKemudi: {
      title: 'Stabilitas Kemudi',
      data: [
        { label: 'Kecepatan Rendah', value: 91, percentage: 91 },
        { label: 'Kecepatan Sedang', value: 85, percentage: 85 },
        { label: 'Kecepatan Tinggi', value: 78, percentage: 78 },
        { label: 'Kondisi Basah', value: 72, percentage: 72 },
      ],
    },
    koordinasiTanganMata: {
      title: 'Koordinasi Tangan-Mata',
      data: [
        { label: 'Target Statis', value: 88, percentage: 88 },
        { label: 'Target Bergerak', value: 82, percentage: 82 },
        { label: 'Multi Target', value: 75, percentage: 75 },
        { label: 'Kondisi Gelap', value: 70, percentage: 70 },
      ],
    },
  };

  // Statistics data
  statistics = {
    totalTests: 189,
    averageReactionTime: 0.61,
    bestReactionTime: 0.35,
    worstReactionTime: 1.4,
    improvementRate: 15.3,
    precisionRate: 83.7,
    lastTestDate: '2024-01-15',
    testDuration: '12 menit',
  };

  // Steering scenarios
  steeringScenarios = [
    {
      scenario: 'Belok di Perempatan',
      difficulty: 'Sedang',
      reactionTime: 0.65,
      precision: 88,
      stability: 85,
      status: 'good',
    },
    {
      scenario: 'Menghindar Rintangan',
      difficulty: 'Tinggi',
      reactionTime: 0.82,
      precision: 76,
      stability: 72,
      status: 'average',
    },
    {
      scenario: 'Parkir Paralel',
      difficulty: 'Tinggi',
      reactionTime: 0.95,
      precision: 82,
      stability: 78,
      status: 'average',
    },
    {
      scenario: 'Jalan Lurus',
      difficulty: 'Rendah',
      reactionTime: 0.38,
      precision: 94,
      stability: 92,
      status: 'excellent',
    },
  ];

  // Driving factors
  drivingFactors = [
    {
      factor: 'Kondisi Fisik',
      impact: 'Tinggi',
      description: 'Kekuatan dan kelenturan tangan mempengaruhi presisi kemudi',
      icon: 'fitness-outline',
      color: '#ff6b6b',
    },
    {
      factor: 'Konsentrasi',
      impact: 'Sangat Tinggi',
      description: 'Fokus yang baik meningkatkan kecepatan dan akurasi reaksi',
      icon: 'eye-outline',
      color: '#ff4757',
    },
    {
      factor: 'Pengalaman',
      impact: 'Tinggi',
      description: 'Pengalaman mengemudi mempengaruhi insting dan reaksi',
      icon: 'car-outline',
      color: '#ff6b6b',
    },
    {
      factor: 'Kondisi Jalan',
      impact: 'Sedang',
      description: 'Permukaan jalan dan cuaca mempengaruhi kontrol kemudi',
      icon: 'cloud-outline',
      color: '#ffa502',
    },
  ];

  // Recent steering tests
  recentTests = [
    {
      id: 1,
      time: '1 jam yang lalu',
      reactionTime: 0.58,
      scenario: 'Belok Kanan',
      precision: 90,
      stability: 87,
      status: 'excellent',
    },
    {
      id: 2,
      time: '3 jam yang lalu',
      reactionTime: 0.72,
      scenario: 'Menghindar',
      precision: 78,
      stability: 75,
      status: 'average',
    },
    {
      id: 3,
      time: '6 jam yang lalu',
      reactionTime: 0.45,
      scenario: 'Lurus',
      precision: 95,
      stability: 92,
      status: 'excellent',
    },
    {
      id: 4,
      time: '1 hari yang lalu',
      reactionTime: 1.1,
      scenario: 'Parkir',
      precision: 70,
      stability: 68,
      status: 'poor',
    },
  ];

  // Training recommendations
  trainingRecommendations = [
    {
      title: 'Latihan Reaksi Cepat',
      description:
        'Latih kemudi dengan simulator untuk meningkatkan kecepatan reaksi',
      icon: 'speedometer-outline',
      priority: 'high',
    },
    {
      title: 'Peningkatan Presisi',
      description: 'Latih kemudi halus dan presisi di berbagai kecepatan',
      icon: 'construct-outline',
      priority: 'medium',
    },
    {
      title: 'Koordinasi Tangan-Mata',
      description: 'Latih koordinasi dengan permainan dan latihan khusus',
      icon: 'handyman-outline',
      priority: 'medium',
    },
    {
      title: 'Manajemen Kelelahan',
      description: 'Kenali tanda-tanda kelelahan yang mempengaruhi kemudi',
      icon: 'bed-outline',
      priority: 'high',
    },
  ];

  // Performance trends
  performanceTrends = {
    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    data: [82, 85, 79, 88, 91, 87, 90],
  };

  // Weekly performance data for new chart format
  weeklyPerformanceData = [
    { day: 'Sen', value: 82, score: '82%' },
    { day: 'Sel', value: 85, score: '85%' },
    { day: 'Rab', value: 79, score: '79%' },
    { day: 'Kam', value: 88, score: '88%' },
    { day: 'Jum', value: 91, score: '91%' },
    { day: 'Sab', value: 87, score: '87%' },
    { day: 'Min', value: 90, score: '90%' },
  ];

  // Get highest value for highlighting
  getHighestValue(): number {
    return Math.max(...this.weeklyPerformanceData.map((item) => item.value));
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
    Object.keys(this.chartData).forEach((key) => {
      this.chartData[key as keyof typeof this.chartData].data.forEach(
        (item) => {
          const variation = Math.random() * 0.2 - 0.1;
          item.value = Math.max(0, item.value + variation);
          item.percentage = Math.max(
            0,
            Math.min(100, item.percentage + variation * 10)
          );
        }
      );
    });
  }

  getBarColor(value: number): string {
    if (value >= 80) return '#28a745';
    if (value >= 60) return '#ffc107';
    return '#dc3545';
  }

  getReactionTimeColor(time: number): string {
    if (time <= 0.5) return '#28a745';
    if (time <= 0.8) return '#ffc107';
    if (time <= 1.2) return '#fd7e14';
    return '#dc3545';
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'Rendah':
        return '#28a745';
      case 'Sedang':
        return '#ffc107';
      case 'Tinggi':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'excellent':
        return '#28a745';
      case 'good':
        return '#17a2b8';
      case 'average':
        return '#ffc107';
      case 'poor':
        return '#fd7e14';
      default:
        return '#6c757d';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high':
        return '#dc3545';
      case 'medium':
        return '#ffc107';
      case 'low':
        return '#28a745';
      default:
        return '#6c757d';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'excellent':
        return 'Sempurna';
      case 'good':
        return 'Baik';
      case 'average':
        return 'Cukup';
      case 'poor':
        return 'Buruk';
      default:
        return 'Tidak Diketahui';
    }
  }

  refreshData() {
    this.updateChartData();
  }

  exportData() {
    console.log('Exporting waktu reaksi kemudi data...');
  }

  startSteeringTest() {
    console.log('Starting steering reaction test...');
  }

  calculateSteeringScore(
    reactionTime: number,
    precision: number,
    stability: number
  ): number {
    const reactionScore = Math.max(0, 100 - reactionTime * 50);
    const weightedScore =
      reactionScore * 0.4 + precision * 0.35 + stability * 0.25;
    return Math.round(weightedScore);
  }
}
