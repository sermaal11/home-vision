import { Injectable } from "@angular/core";
import { API_CONFIG } from "../config/api.config";

@Injectable({
	providedIn: "root",
})
export class ApiService {

	async getHealth() {
		const response = await fetch(API_CONFIG.health);
		return await response.json();
	}

	async sendFrame(blob: Blob) {
		const formData = new FormData();
		formData.append("frame", blob, "frame.jpg");
		const response = await fetch(API_CONFIG.frame, {
			method: "POST",
			body: formData,
		});
		return await response.blob();
	}
}