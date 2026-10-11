/**
 * Two-tone ring loop via WebAudio (no audio assets needed). Call `stop`
 * before starting a new loop; safe to call stop when idle.
 */
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
