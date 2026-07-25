import { useAudioWaveform } from '@package/hooks';
import { Button, Icon, cn } from '@package/ui';
import { useCallback, useRef, useState } from 'react';
import type { Attachment } from '../editor';

interface VoicePreviewProps {
  attachment: Attachment;
  onRemove: () => void;
}

export function VoicePreview({ attachment, onRemove }: VoicePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const amplitudeHistory = useAudioWaveform(attachment.url);

  const createAudio = useCallback(() => {
    const audio = new Audio(attachment.url);

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
      }
    };
    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    audio.onerror = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    return audio;
  }, [attachment.url]);

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = createAudio();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const filledBars = Math.floor(progress * amplitudeHistory.length);

  return (
    <div className="relative flex items-center gap-2 px-3.5 py-3 rounded-[6px] border border-gray-200 shadow-[0_1px_2px_0_rgba(30,30,30,0.05)]">
      <Button
        icon="audio"
        size="icon-xs"
        onClick={togglePlay}
        className={cn(isPlaying ? 'text-primary-500' : 'text-gray-500')}
      />

      <div className="flex-1 min-w-0 flex items-center h-8">
        {amplitudeHistory.map((amplitude, i) => {
          const isFilled = i < filledBars;
          const minHeight = 0.08;
          const height = Math.max(minHeight, amplitude);

          return (
            <span
              key={i}
              className="flex-1 mx-px rounded-full transition-[height] duration-75"
              style={{
                height: `${height * 100}%`,
                backgroundColor: isFilled
                  ? 'var(--color-primary-500, #6366f1)'
                  : 'var(--color-gray-300, #d1d5db)',
              }}
            />
          );
        })}
      </div>

      <Button
        type="button"
        onClick={onRemove}
        className={cn(
          'absolute cursor-pointer flex items-center justify-center h-4 w-4 rounded-full text-white-base border-white-base bg-gray-700 transition-colors hover:bg-gray-800',
          'top-0 right-0 translate-x-1/2 -translate-y-1/2',
        )}
        showTooltip
        tooltipPlacement="top-left"
        tooltipText="Remove"
        aria-label="Remove"
        size="icon-xs"
      >
        <Icon name="close" size={10} />
      </Button>
    </div>
  );
}
