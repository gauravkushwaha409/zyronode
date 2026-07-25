import { useEffect, useState } from 'react';

const DEFAULT_TOTAL_BARS = 240;

export function useAudioWaveform(
  url: string | null,
  totalBars = DEFAULT_TOTAL_BARS,
) {
  const [amplitudeHistory, setAmplitudeHistory] = useState<number[]>(() =>
    new Array(totalBars).fill(0),
  );

  useEffect(() => {
    if (!url) return;

    let cancelled = false;

    const decode = async () => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();

        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        await audioContext.close();

        if (cancelled) return;

        const channelData = audioBuffer.getChannelData(0);
        const samplesPerBar = Math.floor(channelData.length / totalBars);
        const amplitudes: number[] = [];

        for (let i = 0; i < totalBars; i++) {
          const start = i * samplesPerBar;
          let sum = 0;
          for (let j = 0; j < samplesPerBar; j++) {
            sum += Math.abs(channelData[start + j] ?? 0);
          }
          amplitudes.push(sum / samplesPerBar);
        }

        const max = Math.max(...amplitudes, 0.001);
        const normalized = amplitudes.map((a) => a / max);

        setAmplitudeHistory(normalized);
      } catch {
        setAmplitudeHistory(new Array(totalBars).fill(0.08));
      }
    };

    decode();

    return () => {
      cancelled = true;
    };
  }, [url, totalBars]);

  return amplitudeHistory;
}
