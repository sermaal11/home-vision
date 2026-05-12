import { Component, ElementRef, ViewChild, AfterViewInit, viewChild } from "@angular/core";

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

	async ngAfterViewInit() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true });
			this.videoElement.nativeElement.srcObject = stream;
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

		canvas.toBlob((blob) => {
			console.log("Captured image blob: ", blob);
		}, 'image/jpeg');
		
	} 
}