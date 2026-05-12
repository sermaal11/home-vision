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
}