import { AfterViewInit, Component, ElementRef, signal, ViewChild } from "@angular/core";
import { NgIf } from "@angular/common";
import { ApiService } from "../../services/api.service";

@Component({
	selector: "app-camera",
	templateUrl: "./camera.html",
	standalone: true,
	imports: [NgIf],
})

export class CameraComponent implements AfterViewInit {
	
	@ViewChild('videoElement')
	videoElement!: ElementRef<HTMLVideoElement>;

	@ViewChild('canvasElement')
	canvasElement!: ElementRef<HTMLCanvasElement>;

	constructor(private apiService: ApiService) {}

	processedFrameUrl = signal('');
	private latestProcessedFrameUrl = '';

	async ngAfterViewInit() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true });
			this.videoElement.nativeElement.srcObject = stream;
			setInterval(() => this.captureFrame(), 100); // Capture a frame every second
		} catch (error) {
			console.error("Error accessing camera: ", error);
		}
	}

	captureFrame() {
		const video = this.videoElement.nativeElement;
		const canvas = this.canvasElement.nativeElement;
		const context = canvas.getContext('2d');
		if (!context)
			return;
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		context.drawImage(video, 0, 0);
		canvas.toBlob(async (blob) => {
			if (!blob)
				return;
			const response = await this.apiService.sendFrame(blob);
			const nextFrameUrl = URL.createObjectURL(response);
			if (this.latestProcessedFrameUrl) {
				URL.revokeObjectURL(this.latestProcessedFrameUrl);
			}
			this.latestProcessedFrameUrl = nextFrameUrl;
			this.processedFrameUrl.set(nextFrameUrl);
		}, 'image/jpeg');
	} 
}
