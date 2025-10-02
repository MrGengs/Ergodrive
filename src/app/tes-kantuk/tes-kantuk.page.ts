import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-tes-kantuk',
  templateUrl: './tes-kantuk.page.html',
  styleUrls: ['./tes-kantuk.page.scss'],
  standalone: false,
})
export class TesKantukPage implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement?: ElementRef<HTMLCanvasElement>;

  drowsinessStatus: string = 'Belum Terdeteksi';
  eyeAspectRatio: number = 0;
  statusColor: string = 'dark';
  isTestRunning: boolean = false;

  private stream?: MediaStream;
  private detectionInterval: any;

  // Drowsiness detection parameters
  private readonly EAR_THRESHOLD = 0.2;
  private readonly CONSECUTIVE_FRAMES = 20;
  private frameCounter = 0;

  // Chart data, statistics, etc. (keeping the original data)
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
  weeklyPerformanceData = [
    { day: 'Sen', value: 72, score: '72%' },
    { day: 'Sel', value: 68, score: '68%' },
    { day: 'Rab', value: 75, score: '75%' },
    { day: 'Kam', value: 82, score: '82%' },
    { day: 'Jum', value: 79, score: '79%' },
    { day: 'Sab', value: 85, score: '85%' },
    { day: 'Min', value: 78, score: '78%' }
  ];

  private updateInterval: any;

  constructor() {}

  async ngOnInit() {
    this.startRealTimeUpdates();
    await this.loadModels();
  }

  ngOnDestroy() {
    this.stopSleepTest();
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  // --- Test Control Methods ---
  async startSleepTest() {
    console.log('Starting sleep test...');
    this.isTestRunning = true;
    this.drowsinessStatus = 'Memulai kamera...';
    this.statusColor = 'warning';
    await this.startWebcam();
  }

  stopSleepTest() {
    console.log('Stopping sleep test...');
    this.isTestRunning = false;
    this.stopWebcam();
    this.drowsinessStatus = 'Tes Dihentikan';
    this.eyeAspectRatio = 0;
    this.statusColor = 'dark';
  }

  // --- Webcam and Face Detection Logic ---
  private async loadModels() {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/assets/weights');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/assets/weights');
      console.log('Face-API models loaded successfully.');
    } catch (error) {
      console.error('Error loading Face-API models:', error);
      this.drowsinessStatus = 'Gagal memuat model';
      this.statusColor = 'danger';
    }
  }

  private async startWebcam() {
    if (!this.videoElement) return;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      this.videoElement.nativeElement.srcObject = this.stream;
      this.videoElement.nativeElement.addEventListener('play', () => {
        this.setupCanvas();
        this.startFaceDetection();
      });
    } catch (error) {
      console.error('Error accessing webcam:', error);
      this.drowsinessStatus = 'Kamera tidak dapat diakses';
      this.statusColor = 'danger';
    }
  }

  private stopWebcam() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
    }
  }

  private setupCanvas() {
    if (!this.videoElement || !this.canvasElement) return;
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const displaySize = { width: video.clientWidth, height: video.clientHeight };
    faceapi.matchDimensions(canvas, displaySize);
  }

  private startFaceDetection() {
    this.detectionInterval = setInterval(async () => {
      if (!this.videoElement || !this.canvasElement) return;

      const video = this.videoElement.nativeElement;
      const canvas = this.canvasElement.nativeElement;
      const displaySize = { width: video.clientWidth, height: video.clientHeight };

      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();
      
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      }

      if (resizedDetections.length > 0) {
        this.processDrowsiness(resizedDetections[0].landmarks);
      } else {
        this.drowsinessStatus = 'Wajah tidak terdeteksi';
        this.statusColor = 'warning';
        this.frameCounter = 0;
      }
    }, 100);
  }

  private processDrowsiness(landmarks: faceapi.FaceLandmarks68) {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    const leftEAR = this.calculateEAR(leftEye);
    const rightEAR = this.calculateEAR(rightEye);

    this.eyeAspectRatio = (leftEAR + rightEAR) / 2.0;

    if (this.eyeAspectRatio < this.EAR_THRESHOLD) {
      this.frameCounter++;
      if (this.frameCounter >= this.CONSECUTIVE_FRAMES) {
        this.drowsinessStatus = 'Mengantuk Terdeteksi!';
        this.statusColor = 'danger';
      }
    } else {
      this.frameCounter = 0;
      this.drowsinessStatus = 'Aman';
      this.statusColor = 'success';
    }
  }

  private calculateEAR(eye: faceapi.Point[]): number {
    const p2_p6 = this.distance(eye[1], eye[5]);
    const p3_p5 = this.distance(eye[2], eye[4]);
    const p1_p4 = this.distance(eye[0], eye[3]);
    const ear = (p2_p6 + p3_p5) / (2.0 * p1_p4);
    return ear;
  }

  private distance(p1: faceapi.Point, p2: faceapi.Point): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  // --- Original Methods ---
  private startRealTimeUpdates() {
    this.updateInterval = setInterval(() => {
      this.updateChartData();
    }, 5000);
  }

  getHighestValue(): number {
    return Math.max(...this.weeklyPerformanceData.map(item => item.value));
  }

  updateChartData() {
    Object.keys(this.chartData).forEach(key => {
      (this.chartData as any)[key].data.forEach((item: any) => {
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
}