/** Maps getUserMedia failures to actionable UI messages. */
export function toMediaErrorMessage(err: unknown): string {
	if (err instanceof DOMException || err instanceof Error) {
		switch (err.name) {
			case "NotAllowedError":
				return "Microphone/camera access was denied. Allow access and try again.";
			case "NotFoundError":
				return "No microphone or camera found on this device.";
			case "NotReadableError":
				return "The microphone or camera is already in use by another app.";
			case "OverconstrainedError":
				return "This device cannot satisfy the requested media settings.";
			default:
				return err.message || "Could not access microphone/camera.";
		}
	}
	return "Could not access microphone/camera.";
}

/** Visitor peer id for this browser, decoded from the call token (identity only). */
export function visitorPeerIdFromToken(token: string): string | null {
	try {
		const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as {
			visitorId?: string;
		};
		return payload.visitorId ? `visitor:${payload.visitorId}` : null;
	} catch {
		return null;
	}
}

/** Two-tone ring loop via WebAudio (no audio assets needed). */
export function createRingtone(): { start: () => void; stop: () => void } {
	let ctx: AudioContext | null = null;
	let timer: number | null = null;

	const beep = (when: number, freq: number) => {
		if (!ctx) return;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = "sine";
		osc.frequency.value = freq;
		gain.gain.setValueAtTime(0.0001, when);
		gain.gain.exponentialRampToValueAtTime(0.2, when + 0.02);
		gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.4);
		osc.connect(gain).connect(ctx.destination);
		osc.start(when);
		osc.stop(when + 0.45);
	};

	return {
		start: () => {
			if (timer !== null) return;
			ctx ??= new AudioContext();
			void ctx.resume();
			const pattern = () => {
				if (!ctx) return;
				const t = ctx.currentTime;
				beep(t, 440);
				beep(t + 0.5, 480);
			};
			pattern();
			timer = window.setInterval(pattern, 2000);
		},
		stop: () => {
			if (timer !== null) {
				window.clearInterval(timer);
				timer = null;
			}
		},
	};
}
