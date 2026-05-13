import { Injectable } from "@angular/core";
import { API_CONFIG } from "../config/api.config";

@Injectable({
	providedIn: "root",
})
export class ApiService {

	async getHealth() {
		const response = await fetch(API_CONFIG.health);
		if (!response.ok) {
			throw new Error(`Health request failed: ${response.status}`);
		}
		return await response.json();
	}

	async getFrameHealth() {
		const response = await fetch(API_CONFIG.frameHealth);
		if (!response.ok) {
			throw new Error(`Frame health request failed: ${response.status}`);
		}
		return await response.json();
	}

	async getMediapipeHealth() {
		const response = await fetch(API_CONFIG.mediapipeHealth);
		if (!response.ok) {
			throw new Error(`Mediapipe health request failed: ${response.status}`);
		}
		return await response.json();
	}

	async getOriginalFrame(blob: Blob) {
		const formData = new FormData();
		formData.append("frame", blob, "frame.jpg");
		const response = await fetch(API_CONFIG.frame, {
			method: "POST",
			body: formData,
		});
		if (!response.ok) {
			throw new Error(`Frame request failed: ${response.status}`);
		}
		return await response.blob();
	}

	async getGrayscaleFrame(blob: Blob) {
		const formData = new FormData();
		formData.append("frame", blob, "frame.jpg");
		const response = await fetch(API_CONFIG.grayscaleFrame, {
			method: "POST",
			body: formData,
		});
		if (!response.ok) {
			throw new Error(`Grayscale frame request failed: ${response.status}`);
		}
		return await response.blob();
	}

	async getBlurFrame(blob: Blob) {
		const formData = new FormData();
		formData.append("frame", blob, "frame.jpg");
		const response = await fetch(API_CONFIG.blurFrame, {
			method: "POST",
			body: formData,
		});
		if (!response.ok) {
			throw new Error(`Blur frame request failed: ${response.status}`);
		}
		return await response.blob();
	}

	async getDifferenceFrame(blob: Blob) {
		const formData = new FormData();
		formData.append("frame", blob, "frame.jpg");
		const response = await fetch(API_CONFIG.differenceFrame, {
			method: "POST",
			body: formData,
		});
		if (!response.ok) {
			throw new Error(`Difference frame request failed: ${response.status}`);
		}
		return await response.blob();
	}

	async getThresholdFrame(blob: Blob) {
		const formData = new FormData();
		formData.append("frame", blob, "frame.jpg");
		const response = await fetch(API_CONFIG.thresholdFrame, {
			method: "POST",
			body: formData,
		});
		if (!response.ok) {
			throw new Error(`Threshold frame request failed: ${response.status}`);
		}
		return await response.blob();
	}

	async getContoursFrame(blob: Blob) {
		const formData = new FormData();
		formData.append("frame", blob, "frame.jpg");
		const response = await fetch(API_CONFIG.contoursFrame, {
			method: "POST",
			body: formData,
		});
		if (!response.ok) {
			throw new Error(`Contours frame request failed: ${response.status}`);
		}
		return await response.blob();
	}

	async getMotionBoxesFrame(blob: Blob) {
		const formData = new FormData();
		formData.append("frame", blob, "frame.jpg");
		const response = await fetch(API_CONFIG.motionBoxesFrame, {
			method: "POST",
			body: formData,
		});
		if (!response.ok) {
			throw new Error(`Motion boxes frame request failed: ${response.status}`);
		}
		return await response.blob();
	}

	async getMotionOverlayFrame(frame: Blob, difference: Blob) {
		const formData = new FormData();
		formData.append("frame", frame, "frame.jpg");
		formData.append("difference", difference, "difference.jpg");
		const response = await fetch(API_CONFIG.motionOverlayFrame, {
			method: "POST",
			body: formData,
		});
		if (!response.ok) {
			throw new Error(`Motion overlay frame request failed: ${response.status}`);
		}
		return await response.blob();
	}

	async detectFaces(blob: Blob) {
		const formData = new FormData();
		formData.append("frame", blob, "frame.jpg");
		const response = await fetch(API_CONFIG.mediapipeFace, {
			method: "POST",
			body: formData,
		});
		if (!response.ok) {
			throw new Error(`Mediapipe face detection request failed: ${response.status}`);
		}
		return await response.blob();
	}

	async detectFaceMesh(blob: Blob) {
		const formData = new FormData();
		formData.append("frame", blob, "frame.jpg");
		const response = await fetch(API_CONFIG.mediapipeFaceMesh, {
			method: "POST",
			body: formData,
		});
		if (!response.ok) {
			throw new Error(`Mediapipe face mesh detection request failed: ${response.status}`);
		}
		return await response.blob();
	}
}
