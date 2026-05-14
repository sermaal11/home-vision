import { NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, signal, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-motion-detection-page',
  standalone: true,
  imports: [NgIf],
  templateUrl: './motion-detection-page.html',
})
export class MotionDetectionPage implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement')
  videoElement!: ElementRef<HTMLVideoElement>;

  @ViewChild('canvasElement')
  canvasElement!: ElementRef<HTMLCanvasElement>;

  grayscaleFrameUrl = signal('');
  blurFrameUrl = signal('');
  differenceFrameUrl = signal('');
  thresholdFrameUrl = signal('');
  contoursFrameUrl = signal('');
  motionBoxesFrameUrl = signal('');
  motionOverlayFrameUrl = signal('');

  private latestGrayscaleFrameUrl = '';
  private latestBlurFrameUrl = '';
  private latestDifferenceFrameUrl = '';
  private latestThresholdFrameUrl = '';
  private latestContoursFrameUrl = '';
  private latestMotionBoxesFrameUrl = '';
  private latestMotionOverlayFrameUrl = '';
  private captureIntervalId?: ReturnType<typeof setInterval>;
  private isCapturingFrame = false;
  private stream?: MediaStream;

  constructor(private apiService: ApiService) {}

  async ngAfterViewInit() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        return;
      }
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      this.videoElement.nativeElement.srcObject = this.stream;
      this.captureIntervalId = setInterval(() => this.captureFrame(), 100);
    } catch (error) {
      console.error('Error accessing camera: ', error);
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
        const [grayscaleFrame, blurFrame, differenceFrame] = await Promise.all([
          this.apiService.getGrayscaleFrame(blob),
          this.apiService.getBlurFrame(blob),
          this.apiService.getDifferenceFrame(blob),
        ]);
        const [thresholdFrame, contoursFrame, motionBoxesFrame, motionOverlayFrame] = await Promise.all([
          this.apiService.getThresholdFrame(differenceFrame),
          this.apiService.getContoursFrame(differenceFrame),
          this.apiService.getMotionBoxesFrame(differenceFrame),
          this.apiService.getMotionOverlayFrame(blob, differenceFrame),
        ]);

        const nextGrayscaleFrameUrl = URL.createObjectURL(grayscaleFrame);
        const nextBlurFrameUrl = URL.createObjectURL(blurFrame);
        const nextDifferenceFrameUrl = URL.createObjectURL(differenceFrame);
        const nextThresholdFrameUrl = URL.createObjectURL(thresholdFrame);
        const nextContoursFrameUrl = URL.createObjectURL(contoursFrame);
        const nextMotionBoxesFrameUrl = URL.createObjectURL(motionBoxesFrame);
        const nextMotionOverlayFrameUrl = URL.createObjectURL(motionOverlayFrame);

        this.revokeLatestFrameUrls();

        this.latestGrayscaleFrameUrl = nextGrayscaleFrameUrl;
        this.latestBlurFrameUrl = nextBlurFrameUrl;
        this.latestDifferenceFrameUrl = nextDifferenceFrameUrl;
        this.latestThresholdFrameUrl = nextThresholdFrameUrl;
        this.latestContoursFrameUrl = nextContoursFrameUrl;
        this.latestMotionBoxesFrameUrl = nextMotionBoxesFrameUrl;
        this.latestMotionOverlayFrameUrl = nextMotionOverlayFrameUrl;
        this.grayscaleFrameUrl.set(nextGrayscaleFrameUrl);
        this.blurFrameUrl.set(nextBlurFrameUrl);
        this.differenceFrameUrl.set(nextDifferenceFrameUrl);
        this.thresholdFrameUrl.set(nextThresholdFrameUrl);
        this.contoursFrameUrl.set(nextContoursFrameUrl);
        this.motionBoxesFrameUrl.set(nextMotionBoxesFrameUrl);
        this.motionOverlayFrameUrl.set(nextMotionOverlayFrameUrl);
      } catch (error) {
        console.error('Error processing camera frame: ', error);
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
      this.latestGrayscaleFrameUrl,
      this.latestBlurFrameUrl,
      this.latestDifferenceFrameUrl,
      this.latestThresholdFrameUrl,
      this.latestContoursFrameUrl,
      this.latestMotionBoxesFrameUrl,
      this.latestMotionOverlayFrameUrl,
    ].forEach((frameUrl) => {
      if (frameUrl) {
        URL.revokeObjectURL(frameUrl);
      }
    });
  }
}
