import { NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, signal, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-face-detection-page',
  standalone: true,
  imports: [NgIf],
  templateUrl: './face-detection-page.html',
})
export class FaceDetectionPage implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement')
  videoElement!: ElementRef<HTMLVideoElement>;

  @ViewChild('canvasElement')
  canvasElement!: ElementRef<HTMLCanvasElement>;

  originalFrameUrl = signal('');
  faceBoxFrameUrl = signal('');
  cameraError = signal('');

  private latestOriginalFrameUrl = '';
  private latestFaceBoxFrameUrl = '';
  private captureIntervalId?: ReturnType<typeof setInterval>;
  private isCapturingFrame = false;
  private stream?: MediaStream;

  constructor(private apiService: ApiService) {}

  async ngAfterViewInit() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        this.cameraError.set('La cámara no está disponible en este navegador.');
        return;
      }
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      this.videoElement.nativeElement.srcObject = this.stream;
      this.captureIntervalId = setInterval(() => this.captureFrame(), 250);
    } catch (error) {
      console.error('Error accessing camera: ', error);
      this.cameraError.set('No se pudo acceder a la cámara.');
    }
  }

  captureFrame() {
    if (this.isCapturingFrame) {
      return;
    }
    const video = this.videoElement.nativeElement;
    if (!video.videoWidth || !video.videoHeight) {
      return;
    }
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    this.isCapturingFrame = true;
    canvas.toBlob(async (blob) => {
      if (!blob) {
        this.isCapturingFrame = false;
        return;
      }
      try {
        const faceBoxFrame = await this.apiService.detectFaces(blob);
        const nextOriginalFrameUrl = URL.createObjectURL(blob);
        const nextFaceBoxFrameUrl = URL.createObjectURL(faceBoxFrame);
        if (this.latestOriginalFrameUrl) {
          URL.revokeObjectURL(this.latestOriginalFrameUrl);
        }
        if (this.latestFaceBoxFrameUrl) {
          URL.revokeObjectURL(this.latestFaceBoxFrameUrl);
        }
        this.latestOriginalFrameUrl = nextOriginalFrameUrl;
        this.latestFaceBoxFrameUrl = nextFaceBoxFrameUrl;
        this.originalFrameUrl.set(nextOriginalFrameUrl);
        this.faceBoxFrameUrl.set(nextFaceBoxFrameUrl);
      } catch (error) {
        console.error('Error detecting faces: ', error);
      } finally {
        this.isCapturingFrame = false;
      }
    }, 'image/jpeg');
  }

  ngOnDestroy() {
    if (this.captureIntervalId) {
      clearInterval(this.captureIntervalId);
    }
    this.stream?.getTracks().forEach((track) => track.stop());
    if (this.latestOriginalFrameUrl) {
      URL.revokeObjectURL(this.latestOriginalFrameUrl);
    }
    if (this.latestFaceBoxFrameUrl) {
      URL.revokeObjectURL(this.latestFaceBoxFrameUrl);
    }
  }
}
