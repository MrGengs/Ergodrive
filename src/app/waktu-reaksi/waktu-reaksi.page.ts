import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SharedHeaderComponent } from '../components/shared-header/shared-header.component';

export interface Analysis {
  steeringScenario: {
    reactionTime: number;
    precision: number;
    overshoot: number;
  };
  brakeSpeed: {
    reactionTime: number;
    brakingDistance: number;
    pressure: number;
  };
  cognitiveLoad: {
    slowdown: number;
    navigationAccuracy: number;
    attentionLevel: number;
  };
}

export interface ChartData {
  steeringVsFatigue: {
    data: { label: string; value: number }[];
  };
  jarakPengereman: {
    title: string;
    data: { label: string; value: number; percentage: number }[];
  };
  presisiKemudi: {
    title: string;
    data: { label: string; value: number; percentage: number }[];
  };
  akurasiReaksi: {
    title: string;
    data: { label: string; value: number; percentage: number }[];
  };
}

export interface WeeklyPerformance {
  day: string;
  value: number;
  score: number;
}

@Component({
  selector: 'app-waktu-reaksi',
  templateUrl: './waktu-reaksi.page.html',
  styleUrls: ['./waktu-reaksi.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, SharedHeaderComponent],
  encapsulation: ViewEncapsulation.Emulated
})
export class WaktuReaksiPage implements OnInit {
  statistics = {
    overallReactionScore: 85,
    avgSteeringReactionTime: 0.62,
    avgBrakeReactionTime: 1.05,
    overallAccuracyRate: 88.5,
    totalTests: 24,
    improvementRate: 12.5,
    totalEventResponse: 18,
    avgBrakingDistance: 22.3
  };

  analysis: Analysis = {
    steeringScenario: {
      reactionTime: 0.75,
      precision: 82,
      overshoot: 2
    },
    brakeSpeed: {
      reactionTime: 1.05,
      brakingDistance: 25.1,
      pressure: 95
    },
    cognitiveLoad: {
      slowdown: 20,
      navigationAccuracy: 78,
      attentionLevel: 82
    }
  };

  chartData: ChartData = {
    steeringVsFatigue: {
      data: [
        { label: 'Rendah', value: 0.65 },
        { label: 'Sedang', value: 0.8 },
        { label: 'Tinggi', value: 1.2 },
        { label: 'Sangat Tinggi', value: 1.5 }
      ]
    },
    jarakPengereman: {
      title: 'Jarak Pengereman vs Kecepatan',
      data: [
        { label: '40 km/j', value: 12.5, percentage: 50 },
        { label: '60 km/j', value: 22.3, percentage: 70 },
        { label: '80 km/j', value: 35.2, percentage: 100 },
        { label: '100 km/j', value: 52.8, percentage: 150 }
      ]
    },
    presisiKemudi: {
      title: 'Presisi Kemudi per Sudut',
      data: [
        { label: '15°', value: 95, percentage: 95 },
        { label: '30°', value: 88, percentage: 88 },
        { label: '45°', value: 76, percentage: 76 },
        { label: '60°', value: 65, percentage: 65 }
      ]
    },
    akurasiReaksi: {
      title: 'Akurasi Reaksi per Skenario',
      data: [
        { label: 'Lurus', value: 92, percentage: 92 },
        { label: 'Belok', value: 85, percentage: 85 },
        { label: 'Rintangan', value: 78, percentage: 78 },
        { label: 'Mendadak', value: 65, percentage: 65 }
      ]
    }
  };

  weeklyPerformanceData: WeeklyPerformance[] = [
    { day: 'Sen', value: 75, score: 85 },
    { day: 'Sel', value: 82, score: 88 },
    { day: 'Rab', value: 78, score: 85 },
    { day: 'Kam', value: 85, score: 90 },
    { day: 'Jum', value: 90, score: 92 },
    { day: 'Sab', value: 88, score: 91 },
    { day: 'Min', value: 82, score: 87 }
  ];

  constructor() { }

  ngOnInit() {
  }

  getOverallPerformanceColor(score: number): string {
    if (score >= 90) return '#28a745';
    if (score >= 80) return '#17a2b8';
    if (score >= 70) return '#ffc107';
    return '#dc3545';
  }

  getReactionTimeColor(time: number): string {
    if (time <= 0.7) return '#28a745';
    if (time <= 1.0) return '#ffc107';
    return '#dc3545';
  }

  getBarColor(value: number): string {
    if (value >= 90) return '#28a745';
    if (value >= 75) return '#17a2b8';
    if (value >= 60) return '#ffc107';
    return '#dc3545';
  }

  formatDecimal(value: number): string {
    return value.toFixed(2);
  }

  getHighestValue(): number {
    return Math.max(...this.weeklyPerformanceData.map(item => item.value));
  }

  openTestSelection() {
    // Implement test selection logic
    console.log('Opening test selection...');
  }

  refreshData() {
    // Implement data refresh logic
    console.log('Refreshing data...');
  }

  exportData() {
    // Implement data export logic
    console.log('Exporting data...');
  }
}
