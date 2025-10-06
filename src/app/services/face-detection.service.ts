import { Injectable } from '@angular/core';
import * as faceapi from 'face-api.js';

export interface Point2D {
  x: number;
  y: number;
}

export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceLandmarks {
  leftEye: Point2D[];
  rightEye: Point2D[];
  mouth: Point2D[];
}

export interface FaceExpressions {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
  disgusted: number;
  surprised: number;
}

export interface DetectionResult {
  eyeAspectRatio: number;
  mouthAspectRatio: number;
  sleepy: boolean;
  faceBox: FaceBox;
  landmarks: FaceLandmarks;
  expressions: FaceExpressions;
}

@Injectable({
  providedIn: 'root',
})
export class FaceDetectionService {
  private static readonly MODEL_URL = 'assets/weights';
  // Konfigurasi deteksi kantuk
  private static readonly EAR_THRESHOLD = 0.23; // Dikurangi untuk sensitivitas lebih tinggi
  private static readonly EAR_HIGH_THRESHOLD = 0.28; // Untuk konfirmasi mata terbuka
  private static readonly EYE_CLOSED_DURATION_THRESHOLD = 1000; // 1 detik
  private static readonly DETECTION_OPTIONS = new faceapi.TinyFaceDetectorOptions({
    inputSize: 512,      // Ukuran input yang lebih besar untuk deteksi lebih akurat
    scoreThreshold: 0.4, // Ambang kepercayaan dinaikkan untuk mengurangi false positive
  });

  private modelsLoaded = false;
  private loadingPromise: Promise<boolean> | null = null;
  private eyeClosedStartTime: number | null = null;
  private consecutiveFrames = 0;
  private lastDetectionTime = 0;
  private readonly DETECTION_INTERVAL = 50; // ~20fps

  constructor() {}

  /**
   * Memuat semua model yang diperlukan untuk deteksi wajah
   * @returns Promise<boolean> - Status keberhasilan pemuatan model
   */
  async loadModels(): Promise<boolean> {
    if (this.modelsLoaded) return true;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = this.initializeModels();
    return this.loadingPromise;
  }

  private async initializeModels(): Promise<boolean> {
    try {
      console.log('🔄 Memuat model dari:', FaceDetectionService.MODEL_URL);

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(FaceDetectionService.MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(FaceDetectionService.MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(FaceDetectionService.MODEL_URL),
      ]);

      this.modelsLoaded = true;
      console.log('✅ Semua model face-api.js berhasil dimuat');
      return true;
    } catch (error) {
      console.error('❌ Gagal memuat model face-api.js:', error);
      console.error('Pastikan model ada di folder: /assets/weights/');
      this.loadingPromise = null;
      return false;
    }
  }

  /**
   * Mendeteksi wajah dari elemen video
   * @param videoElement - Elemen HTML video untuk dianalisis
   * @returns Promise<DetectionResult | null> - Hasil deteksi wajah atau null jika tidak terdeteksi
   * @throws Error jika model belum dimuat
   */
  async detectFace(videoElement: HTMLVideoElement): Promise<DetectionResult | null> {
    if (!this.modelsLoaded) {
      throw new Error('Model face detection belum dimuat. Panggil loadModels() terlebih dahulu.');
    }

    // Batasi frekuensi deteksi untuk mengurangi beban CPU
    const now = Date.now();
    if (now - this.lastDetectionTime < this.DETECTION_INTERVAL) {
      return null;
    }
    this.lastDetectionTime = now;

    try {
      const result = await faceapi
        .detectSingleFace(videoElement, FaceDetectionService.DETECTION_OPTIONS)
        .withFaceLandmarks()
        .withFaceExpressions();

      if (!result) {
        this.consecutiveFrames = 0;
        return null;
      }

      return this.processDetectionResult(result);
    } catch (error) {
      console.error('Error saat mendeteksi wajah:', error);
      return null;
    }
  }

  private processDetectionResult(result: faceapi.WithFaceExpressions<faceapi.WithFaceLandmarks<{
    detection: faceapi.FaceDetection;
  }, faceapi.FaceLandmarks68>>): DetectionResult {
    const { landmarks, expressions } = result;
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const mouth = landmarks.getMouth();

    // Hitung EAR (Eye Aspect Ratio) untuk kedua mata
    const leftEAR = this.calculateEAR(leftEye);
    const rightEAR = this.calculateEAR(rightEye);
    const eyeAspectRatio = (leftEAR + rightEAR) / 2;
    const mouthAspectRatio = this.calculateMAR(mouth);

    // Deteksi mata tertutup
    const isEyesClosed = eyeAspectRatio < FaceDetectionService.EAR_THRESHOLD;
    const isEyesOpen = eyeAspectRatio > FaceDetectionService.EAR_HIGH_THRESHOLD;
    
    // Update waktu mata tertutup
    const now = Date.now();
    if (isEyesClosed) {
      if (this.eyeClosedStartTime === null) {
        this.eyeClosedStartTime = now;
      }
      this.consecutiveFrames = Math.min(this.consecutiveFrames + 1, 10); // Maksimal 10 frame
    } else if (isEyesOpen) {
      this.eyeClosedStartTime = null;
      this.consecutiveFrames = Math.max(0, this.consecutiveFrames - 2); // Kurangi lebih cepat saat mata terbuka
    }

    // Hitung durasi mata tertutup
    const eyeClosedDuration = this.eyeClosedStartTime ? now - this.eyeClosedStartTime : 0;
    
    // Tentukan status kantuk berdasarkan durasi dan konsistensi
    const isSleepy = isEyesClosed && 
                    this.consecutiveFrames >= 3 && 
                    eyeClosedDuration >= FaceDetectionService.EYE_CLOSED_DURATION_THRESHOLD;

    return {
      eyeAspectRatio,
      mouthAspectRatio,
      sleepy: isSleepy,
      faceBox: this.extractFaceBox(result.detection.box),
      landmarks: {
        leftEye: this.convertPoints(leftEye),
        rightEye: this.convertPoints(rightEye),
        mouth: this.convertPoints(mouth),
      },
      expressions: expressions as FaceExpressions,
    };
  }

  private extractFaceBox(box: faceapi.Box): FaceBox {
    return {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
    };
  }

  private convertPoints(points: faceapi.Point[]): Point2D[] {
    return points.map(({ x, y }) => ({ x, y }));
  }

  /**
   * Menghitung Eye Aspect Ratio (EAR)
   * @param eye - Array titik-titik landmark mata
   * @returns Rasio aspek mata (EAR)
   */
  private calculateEAR(eye: faceapi.Point[]): number {
    if (!eye || eye.length < 6) return 0;
    
    const A = this.distance(eye[1], eye[5]);
    const B = this.distance(eye[2], eye[4]);
    const C = this.distance(eye[0], eye[3]);
    
    return C === 0 ? 0 : (A + B) / (2 * C);
  }

  /**
   * Menghitung Mouth Aspect Ratio (MAR)
   * @param mouth - Array titik-titik landmark mulut
   * @returns Rasio aspek mulut (MAR)
   */
  private calculateMAR(mouth: faceapi.Point[]): number {
    if (!mouth || mouth.length < 20) return 0;
    
    const A = this.distance(mouth[13], mouth[19]);
    const B = this.distance(mouth[14], mouth[18]);
    const C = this.distance(mouth[15], mouth[17]);
    const D = this.distance(mouth[12], mouth[16]);
    
    return D === 0 ? 0 : (A + B + C) / (3 * D);
  }

  /**
   * Menghitung jarak Euclidean antara dua titik 2D
   * @param p1 - Titik pertama
   * @param p2 - Titik kedua
   * @returns Jarak Euclidean antara p1 dan p2
   */
  private distance(p1: Point2D, p2: Point2D): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
