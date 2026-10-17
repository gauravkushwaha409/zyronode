/** Maps getUserMedia/getDisplayMedia failures to actionable UI messages. */
export function toMediaErrorMessage(err: unknown): string {
	if (err instanceof DOMException || err instanceof Error) {
		switch (err.name) {
			case "NotAllowedError":
				return "Microphone/camera access was denied. Allow access in your browser and try again.";
			case "NotFoundError":
				return "No microphone or camera found on this device.";
			case "NotReadableError":
				return "The microphone or camera is already in use by another app.";
			case "OverconstrainedError":
				return "The selected device cannot satisfy the requested settings.";
			case "AbortError":
				return "Media request was interrupted. Try again.";
			default:
				return err.message || "Could not access microphone/camera.";
		}
	}
	return "Could not access microphone/camera.";
}

/** Identity for politeness only (never auth) - decoded from the stored JWT. */
export function getSelfUserId(): string | null {
	try {
		const token = localStorage.getItem("token");
		if (!token) return null;
		const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as {
			id?: string;
		};
		return payload.id ?? null;
	} catch {
		return null;
	}
}
