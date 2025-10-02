import { Injectable } from '@angular/core';
import * as faceapi from 'face-api.js';

export interface DetectionResult {
  eyeAspectRatio: number;
  mouthAspectRatio: number;
  faceBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks: {
    leftEye: Array<{ x: number; y: number }>;
    rightEye: Array<{ x: number; y: number }>;
    mouth: Array<{ x: number; y: number }>;
  };
  expressions: {
    neutral: number;
    happy: number;
    sad: number;
    angry: number;
    fearful: number;
    disgusted: number;
    surprised: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class FaceDetectionService {
  private modelsLoaded = false;
  private readonly EAR_THRESHOLD = 0.25; // Eye Aspect Ratio threshold for eye closure

  async loadModels(): Promise<boolean> {
    try {
      // Load models from public folder
      const MODEL_URL = '/assets/weights';

      console.log('Loading face detection models from:', MODEL_URL);

      // Load models one by one with error handling for each
      try {
        console.log('Loading tinyFaceDetector model...');
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        console.log('tinyFaceDetector model loaded');

        console.log('Loading faceLandmark68Net model...');
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        console.log('faceLandmark68Net model loaded');

        console.log('Loading faceExpressionNet model...');
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        console.log('faceExpressionNet model loaded');

        this.modelsLoaded = true;
        console.log('All face detection models loaded successfully');
        return true;
      } catch (modelError) {
        console.error('Error loading specific model:', modelError);
        throw modelError; // Re-throw to be caught by the outer catch
      }
    } catch (error) {
      console.error('Error loading face detection models:', error);
      console.error(
        'Please ensure the model files are in the correct location at public/assets/weights/'
      );
      return false;
    }
  }

  async detectFace(
    videoElement: HTMLVideoElement
  ): Promise<DetectionResult | null> {
    if (!this.modelsLoaded) {
      throw new Error('Face detection models not loaded');
    }

    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 320,
      scoreThreshold: 0.5,
    });

    const result = await faceapi
      .detectSingleFace(videoElement, options)
      .withFaceLandmarks()
      .withFaceExpressions();

    if (!result) return null;

    const landmarks = result.landmarks;
    const expressions = result.expressions as {
      neutral: number;
      happy: number;
      sad: number;
      angry: number;
      fearful: number;
      disgusted: number;
      surprised: number;
    };

    // Calculate eye aspect ratio (simplified)
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const leftEAR = this.calculateEAR(leftEye);
    const rightEAR = this.calculateEAR(rightEye);
    const eyeAspectRatio = (leftEAR + rightEAR) / 2;

    // Calculate mouth aspect ratio (simplified)
    const mouth = landmarks.getMouth();
    const mouthAspectRatio = this.calculateMAR(mouth);

    return {
      eyeAspectRatio,
      mouthAspectRatio,
      faceBox: {
        x: result.detection.box.x,
        y: result.detection.box.y,
        width: result.detection.box.width,
        height: result.detection.box.height,
      },
      landmarks: {
        leftEye: leftEye.map((p) => ({ x: p.x, y: p.y })),
        rightEye: rightEye.map((p) => ({ x: p.x, y: p.y })),
        mouth: mouth.map((p) => ({ x: p.x, y: p.y })),
      },
      expressions,
    };
  }

  private calculateEAR(eye: any[]): number {
    // Calculate eye aspect ratio (simplified)
    const A = this.distance(eye[1], eye[5]);
    const B = this.distance(eye[2], eye[4]);
    const C = this.distance(eye[0], eye[3]);
    return (A + B) / (2 * C);
  }

  private calculateMAR(mouth: any[]): number {
    // Calculate mouth aspect ratio (simplified)
    const A = this.distance(mouth[13], mouth[19]);
    const B = this.distance(mouth[14], mouth[18]);
    const C = this.distance(mouth[15], mouth[17]);
    const D = this.distance(mouth[12], mouth[16]);
    return (A + B + C) / (3 * D);
  }

  private distance(
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }
}
