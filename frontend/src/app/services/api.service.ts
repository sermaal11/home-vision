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
}
