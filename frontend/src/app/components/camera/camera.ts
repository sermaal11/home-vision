import { Component, ElementRef, ViewChild, AfterViewInit, viewChild } from "@angular/core";

@Component({
	selector: "app-camera",
	templateUrl: "./camera.html",
	standalone: true,
})

export class CameraComponent implements AfterViewInit {
	@ViewChild('videoElement')
	videoElement!: ElementRef<HTMLVideoElement>;
	async ngAfterViewInit() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true });
			this.videoElement.nativeElement.srcObject = stream;
		} catch (error) {
			console.error("Error accessing camera: ", error);
		}
	}
}