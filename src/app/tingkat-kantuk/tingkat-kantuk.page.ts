import { Component, OnDestroy, ViewChild, ElementRef, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set } from 'firebase/database';
import { environment } from '../../environments/environment';
import { SharedHeaderComponent } from '../components/shared-header/shared-header.component';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import Chart from 'chart.js/auto';

declare global {
  interface Window {
    Chart: typeof Chart;
  }
}

@Component({
  selector: 'app-tingkat-kantuk',
  templateUrl: './tingkat-kantuk.page.html',
  styleUrls: ['./tingkat-kantuk.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, SharedHeaderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(10px)'
      })),
      transition('void => *', [
        animate('300ms ease-out', style({
          opacity: 1,
          transform: 'translateY(0)'
        }))
      ]),
      transition('* => void', [
        animate('200ms ease-in', style({
          opacity: 0,
          transform: 'translateY(-10px)'
        }))
      ])
    ])
  ]
})
export class TingkatKantukPage implements AfterViewInit, OnDestroy {
  refreshData() {
    console.log('Refreshing data...');
  }

  exportData() {
    console.log('Exporting data...');
  }
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;
  
  // Status variables
  drowsinessLevel = 'Belum Dimulai';
  statusClass = 'normal';
  statusMessage = 'Belum Memulai';
  statusIcon = 'time-outline';
  statusColor = 'medium';
  showWarning = false;
  cameraReady = false;
  isTesting = false;
  isCameraOn = false;
  testStartTime: Date | null = null;
  testDuration = 0;
  testTimer: any = null;
  
  // Statistics
  averageEAR = 0;
  drowsyCount = 0;
  statusDescription = 'Kamera belum dinyalakan';
  
  // EAR tracking
  private earValues: number[] = [];
  private lastUpdateTime = 0;
  private readonly UPDATE_INTERVAL = 1000; 
  
  // Test history
  testHistory!: Array<{
    timestamp: Date;
    averageEAR: number;
    duration: string;
    status: string;
  }>;
  
  // Stats
  testStats = {
    totalBlinks: 0,
    avgEAR: 0,
    minEAR: 1,
    maxEAR: 0,
    drowsyCount: 0,
    lastUpdate: new Date()
  };
  
  // Camera reference
  private faceMesh: FaceMesh | null = null;
  private cameraInstance: Camera | null = null;
  private earHistory: number[] = [];
  private earChart: any;
  private lastWarningTime = 0;
  private mediaStreamTracks: MediaStreamTrack[] = [];
  
  private readonly MAX_HISTORY = 30;
  private readonly WARNING_INTERVAL = 5000; // 5 detik
  
  // Pengaturan Ambang Batas (Thresholds)
  settings = {
    testDuration: 300, // 5 minutes in seconds
    earWarningThreshold: 0.25, 
    earDangerThreshold: 0.20, 
    enableSound: true,
    enableVibration: true
  };

  constructor() {
    // Initialize test history with example data
    this.testHistory = [
      {
        timestamp: new Date(Date.now() - 3600000), 
        averageEAR: 0.25,
        duration: '05:30',
        status: 'Normal'
      },
      {
        timestamp: new Date(Date.now() - 86400000), 
        averageEAR: 0.19,
        duration: '04:15',
        status: 'Ngantuk Berat'
      }
    ];
  }

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnDestroy() {
    this.stopCamera();
  }
  
  // ===========================================
  // ========== START/STOP TEST LOGIC ==========
  // ===========================================

  // Start the drowsiness test
  async startTest() {
    try {
      // 1. Nyalakan kamera jika belum aktif
      if (!this.isCameraOn) {
        await this.startCamera();
      }
    
      this.isTesting = true;
      this.testStartTime = new Date();
      this.testDuration = 0;
      this.averageEAR = 0;
      this.drowsyCount = 0;
      this.earValues = [];
      this.statusMessage = 'Tes Berjalan';
      this.statusClass = 'normal';
      this.statusIcon = 'play';
      this.statusColor = 'primary';
    
      // Reset dan inisialisasi ulang grafik
      this.initChart();
    
      // 2. Start test timer with updates every second
      this.stopTestTimer(); // Pastikan timer sebelumnya berhenti
      this.testTimer = setInterval(() => {
        if (this.isTesting && this.testStartTime) {
          // Update test duration
          this.testDuration++;
          
          // Update average EAR if we have values
          if (this.earValues.length > 0) {
            const sum = this.earValues.reduce((a, b) => a + b, 0);
            this.averageEAR = sum / this.earValues.length;
            this.earValues = []; // Reset for next interval
          }
        }
      }, 1000);
    
      // 3. Pastikan Mediapipe Camera Instance aktif
      await this.startFaceMesh();
    
    } catch (error) {
      console.error('Gagal memulai tes:', error);
      this.statusDescription = 'Gagal memulai tes (kamera error)';
      this.statusClass = 'danger';
      this.isTesting = false;
    }
  }

  // Stop the test
  stopTest() {
    this.isTesting = false;
    this.stopTestTimer();
    this.showTestSummary();
    
    // Set status kembali ke siap (kamera tetap menyala)
    this.statusMessage = 'Tes Selesai';
    this.statusClass = 'success';
    this.statusIcon = 'stop-circle';
    this.statusColor = 'success';
    this.statusDescription = `Tes Selesai. EAR Rata-rata: ${this.averageEAR.toFixed(3)}`;
  }

  resetTest() {
    try {
      this.stopTest(); // Hentikan tes jika sedang berjalan
      
      // Reset semua metrik
      this.testDuration = 0;
      this.averageEAR = 0;
      this.drowsyCount = 0;
      this.earValues = [];
      this.earHistory = [];
      
      // Reset tampilan
      this.statusMessage = 'Belum Memulai';
      this.statusClass = 'normal';
      this.statusIcon = 'time-outline';
      this.statusColor = 'medium';
      this.statusDescription = this.isCameraOn ? 'Kamera aktif, siap memulai tes' : 'Kamera belum dinyalakan';
      this.drowsinessLevel = 'Belum Dimulai';
      this.resetTestStats();
      
      // Reinitialize the chart to clear data
      setTimeout(() => {
        this.initChart();
      }, 100);
      
      console.log('Test status and EAR graph have been reset');
      
    } catch (error) {
      console.error('Error resetting test:', error);
    }
  }

  private stopTestTimer() {
    if (this.testTimer) {
      clearInterval(this.testTimer);
      this.testTimer = null;
    }
  }

  private resetTestStats() {
    this.testStats = {
      totalBlinks: 0,
      avgEAR: 0,
      minEAR: 1,
      maxEAR: 0,
      drowsyCount: 0,
      lastUpdate: new Date()
    };
    this.testDuration = 0;
  }
  
  // ===========================================
  // ========== CAMERA & FACE MESH LOGIC =======
  // ===========================================

  // Toggle camera on/off
  async toggleCamera() {
    try {
      if (this.isCameraOn) {
        await this.stopCamera();
      } else {
        await this.startCamera();
      }
    } catch (error) {
      console.error('Error toggling camera:', error);
      this.statusDescription = 'Gagal mengontrol kamera';
      this.statusClass = 'danger';
    }
  }

  // Start camera and Mediapipe's Camera Instance
  private async startCamera(): Promise<void> {
    try {
      this.statusDescription = 'Menyiapkan kamera...';

      // 1. Dapatkan video stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      const video = this.videoElement.nativeElement;
      video.srcObject = stream;
      this.mediaStreamTracks = stream.getVideoTracks();

      // Tunggu video siap dimainkan
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          video.play().then(() => resolve()).catch(console.error);
        };
      });

      // 2. Setup Face Mesh (hanya jika belum)
      if (!this.faceMesh) {
        await this.setupFaceMesh();
      }

      // 3. Inisiasi dan Mulai CameraInstance Mediapipe
      if (!this.cameraInstance && this.faceMesh) {
        this.cameraInstance = new Camera(video, {
          onFrame: async () => {
            // PENTING: Kirim frame ke FaceMesh. Ini memicu processFaceMeshResults.
            await this.faceMesh!.send({ image: video });
          },
          width: video.videoWidth,
          height: video.videoHeight
        });
        await this.cameraInstance.start();
      }

      this.statusDescription = 'Kamera aktif, siap mendeteksi.';
      this.isCameraOn = true;
      this.cameraReady = true;

      return Promise.resolve();
    } catch (err) {
      console.error('Error accessing camera:', err);
      this.statusDescription = 'Gagal mengakses kamera';
      this.statusClass = 'danger';
      return Promise.reject(err);
    }
  }

  // Stop camera and clean up resources
  private async stopCamera(): Promise<void> {
    try {
      // Hentikan tes jika sedang berjalan
      if (this.isTesting) {
        this.stopTest();
      }

      // Hentikan MediaPipe camera instance
      if (this.cameraInstance) {
        this.cameraInstance.stop();
        this.cameraInstance = null;
      }
      
      // Hentikan camera stream
      if (this.mediaStreamTracks.length > 0) {
        this.mediaStreamTracks.forEach(track => track.stop());
        this.mediaStreamTracks = [];
      }
      
      // Clear video element
      if (this.videoElement?.nativeElement) {
        this.videoElement.nativeElement.srcObject = null;
      }

      // Clear canvas (fungsi clear di processFaceMeshResults)
      
      // Update status
      this.cameraReady = false;
      this.isCameraOn = false;
      this.statusDescription = 'Kamera dimatikan';
      this.statusClass = 'normal';
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error stopping camera:', error);
      return Promise.reject(error);
    }
  }

  private async setupFaceMesh() {
    // Solusi CORS/WASM/Buffer Mediapipe: Menggunakan versi spesifik untuk stabilitas
    this.faceMesh = new FaceMesh({
      locateFile: (file: string) => 
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`,
    });

    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    
    // PENTING: Pasang listener hasil sebelum memulai Camera Instance
    this.faceMesh.onResults(this.processFaceMeshResults.bind(this));
    
    return true;
  }
  
  private async startFaceMesh() {
    // Fungsi ini hanya memastikan Face Mesh diinisialisasi, dan Camera Instance sudah berjalan
    if (!this.cameraInstance) {
      await this.startCamera(); 
    }
  }

  // Menghapus fungsi stopFaceMesh() karena sudah ditangani di stopCamera()

  // Pemrosesan hasil Face Mesh (ini yang memicu updateChart)
  private processFaceMeshResults(results: any) {
    const video = this.videoElement?.nativeElement;
    const canvas = this.canvasElement?.nativeElement;
    const ctx = canvas?.getContext('2d');
    
    if (!video || !canvas || !ctx) return;
    
    // Update canvas size to match video
    if (video.videoWidth && video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw video frame
    if (results.image) {
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    }

    // Process face landmarks if detected
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      this.drawLandmarks(ctx, landmarks);
      
      // Calculate EAR (Eye Aspect Ratio)
      const ear = this.computeEAR(landmarks);
      
      // Update min/max EAR
      this.testStats.minEAR = Math.min(this.testStats.minEAR, ear);
      this.testStats.maxEAR = Math.max(this.testStats.maxEAR, ear);
      
      // Update chart dan status untuk preview atau test mode
      this.updateChart(ear);
      this.updateStatus(ear);
      
      // Store EAR value for averaging if in test mode
      if (this.isTesting) {
        this.earValues.push(ear);
        
        // Update test stats
        const now = new Date();
        const timeDiff = (now.getTime() - this.testStats.lastUpdate.getTime()) / 1000;
        
        // Detect blinks (rapid eye closure)
        if (ear < this.settings.earDangerThreshold && timeDiff > 0.2) {
          this.testStats.totalBlinks++;
          this.testStats.lastUpdate = now;
        }
      }
    }
  }


  // ===========================================
  // ========== UTILITY & STATUS LOGIC =========
  // ===========================================
  
  getStatusBadgeColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'normal':
      case 'sadar dan fokus 😊 (normal)':
        return 'success';
      case 'waspada':
      case 'mulai mengantuk 🥱 (waspada)':
        return 'warning';
      case 'berbahaya':
      case 'ngantuk berat 😴 (tinggi)':
        return 'danger';
      default:
        return 'medium';
    }
  }

  private showTestSummary() {
    // Hitung rata-rata EAR total dari EAR values yang terkumpul di interval terakhir
    this.testStats.avgEAR = this.averageEAR;
    
    const summary = `
      Hasil Tes Kantuk:
      - Durasi: ${this.formatTime(this.testDuration)}
      - Rata-rata EAR: ${this.testStats.avgEAR.toFixed(3)}
      - Kedipan terdeteksi: ${this.testStats.totalBlinks}
      - Status kantuk: ${this.getDrowsinessLevel()}
    `;
    
    // Add to test history
    this.testHistory.unshift({
      timestamp: new Date(),
      averageEAR: this.testStats.avgEAR,
      duration: this.formatTime(this.testDuration),
      status: this.getDrowsinessLevel()
    });
    
    console.log(summary);
    alert(summary);
  }

  private getDrowsinessLevel(): string {
    // Logika penentuan status berdasarkan rata-rata EAR terakhir atau persentase drowsy
    if (this.testStats.avgEAR < this.settings.earDangerThreshold) return 'Ngantuk Berat';
    if (this.testStats.avgEAR < this.settings.earWarningThreshold) return 'Waspada';
    return 'Normal';
  }

  // Format seconds to MM:SS format (Digunakan di HTML)
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getStatusIcon(): string {
    if (this.statusClass === 'danger') return 'alert-circle';
    if (this.statusClass === 'warning') return 'warning';
    return 'checkmark-circle';
  }

  // ========== VISUALISASI LANDMARK ==========
  private drawLandmarks(ctx: CanvasRenderingContext2D, landmarks: any[]) {
    if (!ctx) return;
    // Warna dan ukuran titik landmark
    ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
    
    // Fungsi untuk menggambar titik
    const drawPoint = (p: any, radius = 2) => {
      if (!p) return;
      ctx.beginPath();
      ctx.arc(p.x * ctx.canvas.width, p.y * ctx.canvas.height, radius, 0, 2 * Math.PI);
      ctx.fill();
    };

    // Gambar landmark mata kiri dan kanan (Hanya untuk debugging visual)
    const leftEyeIndices = [33, 160, 158, 133, 153, 144];
    const rightEyeIndices = [362, 385, 387, 263, 373, 380];
    
    leftEyeIndices.forEach(i => drawPoint(landmarks[i]));
    rightEyeIndices.forEach(i => drawPoint(landmarks[i]));
  }

  // ========== PERHITUNGAN EAR ==========
  private computeEAR(landmarks: any[]): number {
    if (!landmarks || landmarks.length === 0) return 0;
    
    // Indeks landmark untuk mata kiri dan kanan (Mediapipre v0.4)
    const leftEyeIndices = [33, 160, 158, 133, 153, 144]; // Vertikal: 160, 144, 158, 153. Horizontal: 33, 133
    const rightEyeIndices = [362, 385, 387, 263, 373, 380]; // Vertikal: 385, 380, 387, 373. Horizontal: 362, 263
    
    // Hitung EAR untuk kedua mata
    const leftEAR = this.calculateEyeAspectRatio(leftEyeIndices.map(i => landmarks[i]));
    const rightEAR = this.calculateEyeAspectRatio(rightEyeIndices.map(i => landmarks[i]));
    
    // Kembalikan rata-rata EAR kedua mata
    return (leftEAR + rightEAR) / 2;
  }

  private calculateEyeAspectRatio(eyePoints: any[]): number {
    if (eyePoints.length < 6) return 0;
    
    // Menggunakan indeks relatif ke array 6 titik: [0, 1, 2, 3, 4, 5]
    // Vertikal (1-5, 2-4)
    const vertical1 = this.distance(eyePoints[1], eyePoints[5]);
    const vertical2 = this.distance(eyePoints[2], eyePoints[4]);
    
    // Horizontal (0-3)
    const horizontal = this.distance(eyePoints[0], eyePoints[3]);
    
    if (horizontal === 0) return 0;
    
    // Hitung rasio aspek mata (EAR)
    return (vertical1 + vertical2) / (2 * horizontal);
  }

  private distance(p1: any, p2: any): number {
    if (!p1 || !p2) return 0;
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
  }

  // ========== STATUS & PERINGATAN ==========
  private updateStatus(ear: number) {
    // Jika tidak dalam mode tes, kita hanya menampilkan EAR saat ini
    if (!this.isTesting) {
        this.drowsinessLevel = 'Siap untuk memulai tes';
        this.statusDescription = `EAR: ${ear.toFixed(3)} | Status: Siap Memulai`;
        return;
    }
    
    const previousStatus = this.drowsinessLevel;
    
    if (ear < this.settings.earDangerThreshold) {
      // NGANTUK BERAT
      this.drowsinessLevel = 'NGANTUK BERAT 😴 (Tinggi)';
      this.statusClass = 'danger';
      this.statusMessage = 'Sangat Mengantuk';
      this.statusIcon = 'warning';
      this.statusColor = 'danger';
      this.triggerWarning();
      
      if (!previousStatus.includes('NGANTUK BERAT')) {
        this.drowsyCount++;
      }
      
    } else if (ear < this.settings.earWarningThreshold) {
      // WASPADA
      this.drowsinessLevel = 'MULAI MENGANTUK 🥱 (Waspada)';
      this.statusClass = 'warning';
      this.statusMessage = 'Waspada';
      this.statusIcon = 'alert-circle';
      this.statusColor = 'warning';
      this.showWarning = false;
    } else {
      // NORMAL/FOKUS
      this.drowsinessLevel = 'SADAR DAN FOKUS 😊 (Normal)';
      this.statusClass = 'normal';
      this.statusMessage = 'Normal';
      this.statusIcon = 'checkmark-circle';
      this.statusColor = 'success';
      this.showWarning = false;
    }
    
    this.statusDescription = `EAR: ${ear.toFixed(3)} | Status: ${this.statusMessage}`;
  }

  private triggerWarning() {
    if (!this.isTesting) return;
    
    const now = Date.now();
    // Show warning with 5 second cooldown
    if (now - this.lastWarningTime > this.WARNING_INTERVAL) {
      this.showWarning = true;
      
      if (this.settings.enableSound) {
        this.playWarningSound();
      }
      
      if (this.settings.enableVibration && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]); 
      }
      
      this.lastWarningTime = now;
      
      // Hide warning after 3 seconds
      setTimeout(() => {
        this.showWarning = false;
      }, 3000);
    }
  }

  private playWarningSound() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
      
    } catch (e) {
      console.warn('Tidak dapat memutar suara peringatan:', e);
    }
  }

  // ========== CHART LOGIC ==========
  private initChart() {
    try {
      const ctx = document.getElementById('earChart') as HTMLCanvasElement;
      if (!ctx) {
        console.warn('Chart canvas element not found');
        return;
      }
      
      // Clear any existing chart instance
      if (this.earChart) {
        this.earChart.destroy();
      }
      
      // Inisialisasi data garis batas
      const dangerData = Array(this.MAX_HISTORY).fill(this.settings.earDangerThreshold);
      const warningData = Array(this.MAX_HISTORY).fill(this.settings.earWarningThreshold);
      
      this.earChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array(this.MAX_HISTORY).fill(''), 
          datasets: [
            {
              label: 'EAR (Rata-rata)',
              data: Array(this.MAX_HISTORY).fill(0), 
              borderColor: '#3880ff',
              backgroundColor: 'rgba(56, 128, 255, 0.2)',
              borderWidth: 2,
              tension: 0.3,
              fill: true,
              pointRadius: 0
            },
            {
              label: 'Batas Ngantuk Berat', 
              data: dangerData,
              borderColor: '#dc3545',
              borderWidth: 1,
              borderDash: [5, 5],
              pointRadius: 0
            },
            {
              label: 'Batas Waspada', 
              data: warningData,
              borderColor: '#ffc107',
              borderWidth: 1,
              borderDash: [5, 5],
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 0 // Matikan animasi untuk pembaruan cepat
          },
          scales: {
            y: { 
              min: 0, 
              max: 0.5,
              grid: { color: 'rgba(200, 200, 200, 0.2)' },
              ticks: { color: 'var(--ion-color-medium)' }
            },
            x: { display: false }
          },
          plugins: {
            legend: { labels: { color: 'var(--ion-text-color)' } },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  return `${context.dataset.label}: ${context.parsed.y.toFixed(3)}`;
                }
              }
            }
          },
          interaction: { intersect: false, mode: 'index' },
          elements: { line: { tension: 0.4 } }
        }
      });
      
      console.log('Chart initialized successfully');
      
    } catch (error) {
      console.error('Error initializing chart:', error);
    }
  }

  private updateChart(ear: number) {
    if (!this.earChart) return;
    
    try {
      const chartData = this.earChart.data.datasets[0].data;
      
      // Add new data point
      chartData.push(ear);
      
      // Remove the first data point if we've exceeded max history
      if (chartData.length > this.MAX_HISTORY) {
        chartData.shift();
      }
      
      // Update labels (time)
      const now = new Date();
      const timeLabel = now.toLocaleTimeString();
      
      const labels = this.earChart.data.labels;
      if (labels.length < this.MAX_HISTORY) {
        labels.push(timeLabel);
      } else {
        labels.shift();
        labels.push(timeLabel);
      }
      
      // Update chart
      this.earChart.update({
        duration: 0,
        lazy: true
      });
      
    } catch (error) {
      console.error('Error updating chart:', error);
    }
  }
}