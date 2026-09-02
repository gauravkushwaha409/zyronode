import { useCallback, useRef, useState } from "react";

export function useVoiceRecorder() {
	const [isRecording, setIsRecording] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [amplitudeHistory, setAmplitudeHistory] = useState<number[]>(() => new Array(50).fill(0.08));
	const [filledBars, setFilledBars] = useState(0);
	const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const animationRef = useRef<number | null>(null);
	const timerRef = useRef<number | null>(null);
	const startTimeRef = useRef<number>(0);
	const pausedTimeRef = useRef<number>(0);
	const chunksRef = useRef<BlobPart[]>([]);
	const audioContextRef = useRef<AudioContext | null>(null);

	const stopTracks = useCallback(() => {
		streamRef.current?.getTracks().forEach((t) => t.stop());
		streamRef.current = null;
		if (animationRef.current) cancelAnimationFrame(animationRef.current);
		if (timerRef.current) window.clearInterval(timerRef.current);
		analyserRef.current = null;
	}, []);

	const start = useCallback(async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			streamRef.current = stream;
			const audioContext = new AudioContext();
			audioContextRef.current = audioContext;
			const source = audioContext.createMediaStreamSource(stream);
			const analyser = audioContext.createAnalyser();
			analyser.fftSize = 256;
			source.connect(analyser);
			analyserRef.current = analyser;

			const dataArray = new Uint8Array(analyser.frequencyBinCount);
			const updateWaveform = () => {
				if (!analyserRef.current) return;
				analyserRef.current.getByteFrequencyData(dataArray);
				const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255;
				setAmplitudeHistory((prev) => [...prev.slice(1), Math.max(0.08, avg)]);
				setFilledBars((prev) => Math.min(50, prev + 1));
				animationRef.current = requestAnimationFrame(updateWaveform);
			};
			updateWaveform();

			chunksRef.current = [];
			const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
			recorder.ondataavailable = (e) => {
				if (e.data.size > 0) chunksRef.current.push(e.data);
			};
			recorder.onstop = () => {
				const blob = new Blob(chunksRef.current, { type: "audio/webm" });
				setAudioBlob(blob);
				const url = URL.createObjectURL(blob);
				setAudioUrl(url);
				stopTracks();
				audioContext.close().catch(() => {});
			};
			recorder.start(100);
			mediaRecorderRef.current = recorder;

			setIsRecording(true);
			setIsPaused(false);
			setElapsedSeconds(0);
			setFilledBars(0);
			setAmplitudeHistory(new Array(50).fill(0.08));
			setAudioBlob(null);
			if (audioUrl) URL.revokeObjectURL(audioUrl);
			setAudioUrl(null);
			startTimeRef.current = Date.now();
			pausedTimeRef.current = 0;
			timerRef.current = window.setInterval(() => {
				setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000));
			}, 1000);
		} catch (e) {
			console.error("Microphone access denied", e);
		}
	}, [audioUrl, stopTracks]);

	const pause = useCallback(() => {
		if (mediaRecorderRef.current?.state === "recording") {
			mediaRecorderRef.current.pause();
			setIsPaused(true);
			if (animationRef.current) cancelAnimationFrame(animationRef.current);
			if (timerRef.current) window.clearInterval(timerRef.current);
		}
	}, []);

	const resume = useCallback(() => {
		if (mediaRecorderRef.current?.state === "paused") {
			mediaRecorderRef.current.resume();
			setIsPaused(false);
			const analyser = analyserRef.current;
			if (analyser) {
				const dataArray = new Uint8Array(analyser.frequencyBinCount);
				const upd = () => {
					analyser.getByteFrequencyData(dataArray);
					const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255;
					setAmplitudeHistory((prev) => [...prev.slice(1), Math.max(0.08, avg)]);
					setFilledBars((prev) => Math.min(50, prev + 1));
					animationRef.current = requestAnimationFrame(upd);
				};
				upd();
			}
			timerRef.current = window.setInterval(() => {
				setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000));
			}, 1000);
		}
	}, []);

	const cancel = useCallback(() => {
		mediaRecorderRef.current?.stop();
		setTimeout(() => {
			setIsRecording(false);
			setIsPaused(false);
			setElapsedSeconds(0);
			setAudioBlob(null);
			if (audioUrl) URL.revokeObjectURL(audioUrl);
			setAudioUrl(null);
			setAmplitudeHistory(new Array(50).fill(0.08));
			setFilledBars(0);
			chunksRef.current = [];
		}, 100);
		stopTracks();
		audioContextRef.current?.close().catch(() => {});
	}, [audioUrl, stopTracks]);

	const stop = useCallback(() => {
		if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
			mediaRecorderRef.current.stop();
		}
		if (timerRef.current) window.clearInterval(timerRef.current);
		if (animationRef.current) cancelAnimationFrame(animationRef.current);
		setIsRecording(false);
		setIsPaused(false);
	}, []);

	const stopAndGetBlob = useCallback((): Promise<{ blob: Blob; url: string } | null> => {
		return new Promise((resolve) => {
			const recorder = mediaRecorderRef.current;
			if (!recorder || recorder.state === "inactive") {
				if (audioBlob && audioUrl) resolve({ blob: audioBlob, url: audioUrl });
				else resolve(null);
				return;
			}
			const prevOnStop = recorder.onstop;
			recorder.onstop = (ev) => {
				if (prevOnStop) (prevOnStop as (ev: Event) => void)(ev);
				// after prevOnStop, audioBlob/url are set — wait a tick
				setTimeout(() => {
					const blob = new Blob(chunksRef.current, { type: "audio/webm" });
					const url = URL.createObjectURL(blob);
					setAudioBlob(blob);
					setAudioUrl(url);
					resolve({ blob, url });
				}, 50);
			};
			recorder.stop();
			if (timerRef.current) window.clearInterval(timerRef.current);
			if (animationRef.current) cancelAnimationFrame(animationRef.current);
			setIsRecording(false);
			setIsPaused(false);
		});
	}, [audioBlob, audioUrl]);

	const reset = useCallback(() => {
		setIsRecording(false);
		setIsPaused(false);
		setElapsedSeconds(0);
		setAudioBlob(null);
		if (audioUrl) URL.revokeObjectURL(audioUrl);
		setAudioUrl(null);
		setAmplitudeHistory(new Array(50).fill(0.08));
		setFilledBars(0);
		chunksRef.current = [];
		stopTracks();
		audioContextRef.current?.close().catch(() => {});
	}, [audioUrl, stopTracks]);

	return {
		isRecording, isPaused, elapsedSeconds, amplitudeHistory, filledBars, audioBlob, audioUrl,
		start, pause, resume, cancel, stop, stopAndGetBlob, reset, setIsRecording,
	};
}
