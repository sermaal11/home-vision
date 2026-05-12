import { Component, ElementRef, ViewChild, AfterViewInit} from "@angular/core";
import { ApiService } from "../../services/api.service";

@Component({
	selector: "app-camera",
	templateUrl: "./camera.html",
	standalone: true,
})

export class CameraComponent implements AfterViewInit {
	@ViewChild('videoElement')
	videoElement!: ElementRef<HTMLVideoElement>;

	@ViewChild('canvasElement')
	canvasElement!: ElementRef<HTMLCanvasElement>;

	constructor(private apiService: ApiService) {}

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
			console.log("Frame sent, response: ", response);
		}, 'image/jpeg');
	} 
}