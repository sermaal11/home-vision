import { AfterViewInit, Component, ElementRef, OnDestroy, signal, ViewChild } from "@angular/core";
import { NgIf } from "@angular/common";
import { ApiService } from "../../services/api.service";

@Component({
	selector: "app-motion-lab",
	templateUrl: "./motion-lab.html",
	standalone: true,
	imports: [NgIf],
})

export class MotionLabComponent implements AfterViewInit, OnDestroy {

	@ViewChild('videoElement')
	videoElement!: ElementRef<HTMLVideoElement>;

	@ViewChild('canvasElement')
	canvasElement!: ElementRef<HTMLCanvasElement>;

	constructor(private apiService: ApiService) {}

	grayscaleFrameUrl = signal('');
	blurFrameUrl = signal('');
	differenceFrameUrl = signal('');
	thresholdFrameUrl = signal('');
	contoursFrameUrl = signal('');
	motionBoxesFrameUrl = signal('');
	motionOverlayFrameUrl = signal('');
	faceDetectionFrameUrl = signal('');
	faceMeshFrameUrl = signal('');

	private latestGrayscaleFrameUrl = '';
	private latestBlurFrameUrl = '';
	private latestDifferenceFrameUrl = '';
	private latestThresholdFrameUrl = '';
	private latestContoursFrameUrl = '';
	private latestMotionBoxesFrameUrl = '';
	private latestMotionOverlayFrameUrl = '';
	private latestFaceDetectionFrameUrl = '';
	private latestFaceMeshFrameUrl = '';
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
				const [response, blurResponse, differenceResponse] = await Promise.all([
					this.apiService.getGrayscaleFrame(blob),
					this.apiService.getBlurFrame(blob),
					this.apiService.getDifferenceFrame(blob),
				]);
				const [thresholdResponse, contoursResponse, motionBoxesResponse, motionOverlayResponse] = await Promise.all([
					this.apiService.getThresholdFrame(differenceResponse),
					this.apiService.getContoursFrame(differenceResponse),
					this.apiService.getMotionBoxesFrame(differenceResponse),
					this.apiService.getMotionOverlayFrame(blob, differenceResponse),
				]);
				const faceDetectionResponse = await this.apiService.detectFaces(blob);
				const faceMeshResponse = await this.apiService.detectFaceMesh(blob);

				const nextFrameUrl = URL.createObjectURL(response);
				const nextBlurFrameUrl = URL.createObjectURL(blurResponse);
				const nextDifferenceFrameUrl = URL.createObjectURL(differenceResponse);
				const nextThresholdFrameUrl = URL.createObjectURL(thresholdResponse);
				const nextContoursFrameUrl = URL.createObjectURL(contoursResponse);
				const nextMotionBoxesFrameUrl = URL.createObjectURL(motionBoxesResponse);
				const nextMotionOverlayFrameUrl = URL.createObjectURL(motionOverlayResponse);
				const nextFaceDetectionFrameUrl = URL.createObjectURL(faceDetectionResponse);
				const nextFaceMeshFrameUrl = URL.createObjectURL(faceMeshResponse);

				if (this.latestGrayscaleFrameUrl) {
					URL.revokeObjectURL(this.latestGrayscaleFrameUrl);
				}
				if (this.latestBlurFrameUrl) {
					URL.revokeObjectURL(this.latestBlurFrameUrl);
				}
				if (this.latestDifferenceFrameUrl) {
					URL.revokeObjectURL(this.latestDifferenceFrameUrl);
				}
				if (this.latestThresholdFrameUrl) {
					URL.revokeObjectURL(this.latestThresholdFrameUrl);
				}
				if (this.latestContoursFrameUrl) {
					URL.revokeObjectURL(this.latestContoursFrameUrl);
				}
				if (this.latestMotionBoxesFrameUrl) {
					URL.revokeObjectURL(this.latestMotionBoxesFrameUrl);
				}
				if (this.latestMotionOverlayFrameUrl) {
					URL.revokeObjectURL(this.latestMotionOverlayFrameUrl);
				}
				if (this.latestFaceDetectionFrameUrl) {
					URL.revokeObjectURL(this.latestFaceDetectionFrameUrl);
				}
				if (this.latestFaceMeshFrameUrl) {
					URL.revokeObjectURL(this.latestFaceMeshFrameUrl);
				}

				this.latestGrayscaleFrameUrl = nextFrameUrl;
				this.latestBlurFrameUrl = nextBlurFrameUrl;
				this.latestDifferenceFrameUrl = nextDifferenceFrameUrl;
				this.latestThresholdFrameUrl = nextThresholdFrameUrl;
				this.latestContoursFrameUrl = nextContoursFrameUrl;
				this.latestMotionBoxesFrameUrl = nextMotionBoxesFrameUrl;
				this.latestMotionOverlayFrameUrl = nextMotionOverlayFrameUrl;
				this.latestFaceDetectionFrameUrl = nextFaceDetectionFrameUrl;
				this.latestFaceMeshFrameUrl = nextFaceMeshFrameUrl;
				this.grayscaleFrameUrl.set(nextFrameUrl);
				this.blurFrameUrl.set(nextBlurFrameUrl);
				this.differenceFrameUrl.set(nextDifferenceFrameUrl);
				this.thresholdFrameUrl.set(nextThresholdFrameUrl);
				this.contoursFrameUrl.set(nextContoursFrameUrl);
				this.motionBoxesFrameUrl.set(nextMotionBoxesFrameUrl);
				this.motionOverlayFrameUrl.set(nextMotionOverlayFrameUrl);
				this.faceDetectionFrameUrl.set(nextFaceDetectionFrameUrl);
				this.faceMeshFrameUrl.set(nextFaceMeshFrameUrl);
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
		if (this.latestDifferenceFrameUrl) {
			URL.revokeObjectURL(this.latestDifferenceFrameUrl);
		}
		if (this.latestThresholdFrameUrl) {
			URL.revokeObjectURL(this.latestThresholdFrameUrl);
		}
		if (this.latestContoursFrameUrl) {
			URL.revokeObjectURL(this.latestContoursFrameUrl);
		}
		if (this.latestMotionBoxesFrameUrl) {
			URL.revokeObjectURL(this.latestMotionBoxesFrameUrl);
		}
		if (this.latestMotionOverlayFrameUrl) {
			URL.revokeObjectURL(this.latestMotionOverlayFrameUrl);
		}
		if (this.latestFaceDetectionFrameUrl) {
			URL.revokeObjectURL(this.latestFaceDetectionFrameUrl);
		}
		if (this.latestFaceMeshFrameUrl) {
			URL.revokeObjectURL(this.latestFaceMeshFrameUrl);
		}
	}
}
