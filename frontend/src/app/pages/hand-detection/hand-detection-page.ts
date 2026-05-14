import { NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, signal, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-hand-detection-page',
  standalone: true,
  imports: [NgIf],
  templateUrl: './hand-detection-page.html',
})
export class HandDetectionPage implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement')
  videoElement!: ElementRef<HTMLVideoElement>;

  @ViewChild('canvasElement')
  canvasElement!: ElementRef<HTMLCanvasElement>;

  handLandmarksFrameUrl = signal('');
  fingerCountFrameUrl = signal('');
  totalFingerCount = signal(0);
  cameraError = signal('');

  private latestHandLandmarksFrameUrl = '';
  private latestFingerCountFrameUrl = '';
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
        const [handLandmarksFrame, fingerCountFrame] = await Promise.all([
          this.apiService.detectHands(blob),
          this.apiService.countFingers(blob),
        ]);
        const nextHandLandmarksFrameUrl = URL.createObjectURL(handLandmarksFrame);
        const nextFingerCountFrameUrl = URL.createObjectURL(fingerCountFrame.blob);

        this.revokeLatestFrameUrls();

        this.latestHandLandmarksFrameUrl = nextHandLandmarksFrameUrl;
        this.latestFingerCountFrameUrl = nextFingerCountFrameUrl;
        this.handLandmarksFrameUrl.set(nextHandLandmarksFrameUrl);
        this.fingerCountFrameUrl.set(nextFingerCountFrameUrl);
        this.totalFingerCount.set(fingerCountFrame.total);
      } catch (error) {
        console.error('Error processing hand detection frame: ', error);
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
    this.revokeLatestFrameUrls();
  }

  private revokeLatestFrameUrls() {
    [
      this.latestHandLandmarksFrameUrl,
      this.latestFingerCountFrameUrl,
    ].forEach((frameUrl) => {
      if (frameUrl) {
        URL.revokeObjectURL(frameUrl);
      }
    });
  }
}
