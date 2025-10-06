import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';

interface Statistic {
  totalTests: number;
  averageScore: number;
  improvementRate: number;
  totalEvents: number;
  stressLevel: number;
  averageResponseTime: number;
  accuracyRate: number;
}

interface Analysis {
  accuracy: {
    current: number;
    average: number;
    improvement: number;
  };
}

interface ChartDataItem {
  label: string;
  value: number;
  percentage: number;
}

interface ChartDataSet {
  title: string;
  data: ChartDataItem[];
}

interface WeeklyPerformance {
  day: string;
  value: number;
  score: number;
}

@Component({
  selector: 'app-beban-kerja',
  templateUrl: './beban-kerja.page.html',
  styleUrls: ['./beban-kerja.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonicModule, 
    CommonModule, 
    FormsModule, 
    SharedModule,
    RouterModule
  ]
})
export class BebanKerjaPage implements OnInit {
  // Main statistics
  statistics: Statistic = {
    totalTests: 24,
    averageScore: 87.5,
    improvementRate: 5.2,
    totalEvents: 156,
    stressLevel: 32.1,
    averageResponseTime: 0.8,
    accuracyRate: 88.5
  };

  eventTypes = [
    { 
      name: 'Sensor Parkir', 
      icon: 'car-sport-outline',
      count: 24,
      accuracy: 92,
      trend: 'up',
      trendValue: 5.2
    },
    { 
      name: 'Sensor Tabrak', 
      icon: 'warning-outline',
      count: 18,
      accuracy: 88,
      trend: 'up',
      trendValue: 3.7
    },
    { 
      name: 'Sensor Blind Spot', 
      icon: 'eye-off-outline',
      count: 12,
      accuracy: 85,
      trend: 'down',
      trendValue: 2.1
    },
    { 
      name: 'Sensor Lintasan', 
      icon: 'git-merge-outline',
      count: 30,
      accuracy: 90,
      trend: 'up',
      trendValue: 4.5
    }
  ];

  // Detailed analysis
  detailedAnalysis: Analysis = {
    accuracy: {
      current: 85.6,
      average: 82.4,
      improvement: 3.2
    }
  };

  // Chart data
  chartData = {
    sdlp: {
      title: 'Stabilitas Posisi',
      data: [
        { label: 'Minggu Ini', value: 12.5, percentage: 80 },
        { label: 'Rata-rata', value: 15.2, percentage: 65 },
        { label: 'Terbaik', value: 8.3, percentage: 95 }
      ]
    },
    kecepatanRataRata: {
      title: 'Kecepatan Rata-rata',
      data: [
        { label: 'Perkotaan', value: 45, percentage: 70 },
        { label: 'Tol', value: 85, percentage: 90 },
        { label: 'Pemukiman', value: 30, percentage: 85 }
      ]
    },
    deteksiSensor: {
      title: 'Deteksi Sensor',
      data: [
        { label: 'Sensor Parkir', value: 24, percentage: 80 },
        { label: 'Sensor Tabrak', value: 18, percentage: 90 },
        { label: 'Sensor Blind Spot', value: 12, percentage: 85 },
        { label: 'Sensor Lintasan', value: 30, percentage: 75 }
      ]
    },
    akurasiNavigasi: {
      title: 'Akurasi Navigasi',
      data: [
        { label: 'Perintah Suara', value: 92, percentage: 92 },
        { label: 'Tampilan', value: 88, percentage: 88 },
        { label: 'Responsif', value: 85, percentage: 85 }
      ]
    }
  } as const;

  // Weekly performance data
  weeklyPerformanceData: WeeklyPerformance[] = [
    { day: 'Sen', value: 75, score: 78 },
    { day: 'Sel', value: 82, score: 85 },
    { day: 'Rab', value: 78, score: 80 },
    { day: 'Kam', value: 85, score: 88 },
    { day: 'Jum', value: 80, score: 82 },
    { day: 'Sab', value: 88, score: 90 },
    { day: 'Min', value: 90, score: 92 }
  ];

  constructor() { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Simulate API call to load data
    setTimeout(() => {
      console.log('Data loaded');
    }, 1000);
  }

  refreshData() {
    console.log('Refreshing data...');
    this.loadData();
  }

  exportData() {
    console.log('Exporting data...');
    // Implement export logic here
  }

  formatDecimal(value: number): string {
    return value.toFixed(1);
  }

  getBarColor(value: number, type: string): string {
    switch (type) {
      case 'sdlp':
        return value < 10 ? '#10B981' : value < 15 ? '#F59E0B' : '#EF4444';
      case 'speed':
        return value > 80 ? '#EF4444' : value > 60 ? '#F59E0B' : '#10B981';
      case 'event':
        return value > 20 ? '#EF4444' : value > 10 ? '#F59E0B' : '#10B981';
      case 'accuracy':
        return value > 85 ? '#10B981' : value > 70 ? '#F59E0B' : '#EF4444';
      default:
        return '#3B82F6';
    }
  }

  getHighestValue(): number {
    return Math.max(...this.weeklyPerformanceData.map(item => item.value));
  }
}
