import { AfterViewInit, Component, ElementRef, OnDestroy, signal, ViewChild } from "@angular/core";
import { NgIf } from "@angular/common";
import { ApiService } from "../../services/api.service";

@Component({
	selector: "app-camera",
	templateUrl: "./camera.html",
	standalone: true,
	imports: [NgIf],
})

export class CameraComponent implements AfterViewInit, OnDestroy {

	@ViewChild('videoElement')
	videoElement!: ElementRef<HTMLVideoElement>;

	@ViewChild('canvasElement')
	canvasElement!: ElementRef<HTMLCanvasElement>;

	constructor(private apiService: ApiService) {}

	grayscaleFrameUrl = signal('');
	blurFrameUrl = signal('');

	private latestGrayscaleFrameUrl = '';
	private latestBlurFrameUrl = '';
	private captureIntervalId?: ReturnType<typeof setInterval>;
	private isCapturingFrame = false;
	private stream?: MediaStream;

	async ngAfterViewInit() {
		try {
			if (!navigator.mediaDevices?.getUserMedia) {
				return;
			}
			this.stream = await navigator.mediaDevices.getUserMedia({
				video: true
			});
			this.videoElement.nativeElement.srcObject = this.stream;
			this.captureIntervalId = setInterval(() => this.captureFrame(), 100);
		} catch (error) {
			console.error("Error accessing camera: ", error);
		}
	}

	captureFrame() {
		if (this.isCapturingFrame)
			return;
		const video = this.videoElement.nativeElement;
		if (!video.videoWidth || !video.videoHeight)
			return;
		const canvas = this.canvasElement.nativeElement;
		const context = canvas.getContext('2d');
		if (!context)
			return;
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
				const [response, blurResponse] = await Promise.all([
					this.apiService.getGrayscaleFrame(blob),
					this.apiService.getBlurFrame(blob),
				]);
				const nextFrameUrl = URL.createObjectURL(response);
				const nextBlurFrameUrl = URL.createObjectURL(blurResponse);
				if (this.latestGrayscaleFrameUrl) {
					URL.revokeObjectURL(this.latestGrayscaleFrameUrl);
				}
				if (this.latestBlurFrameUrl) {
					URL.revokeObjectURL(this.latestBlurFrameUrl);
				}
				this.latestGrayscaleFrameUrl = nextFrameUrl;
				this.latestBlurFrameUrl = nextBlurFrameUrl;
				this.grayscaleFrameUrl.set(nextFrameUrl);
				this.blurFrameUrl.set(nextBlurFrameUrl);
			} catch (error) {
				console.error("Error processing camera frame: ", error);
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
		if (this.latestGrayscaleFrameUrl) {
			URL.revokeObjectURL(this.latestGrayscaleFrameUrl);
		}
		if (this.latestBlurFrameUrl) {
			URL.revokeObjectURL(this.latestBlurFrameUrl);
		}
	}
}
