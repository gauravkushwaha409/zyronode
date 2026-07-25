import { Button, Typography } from '@package/ui';

interface VoiceMessageProps {
  isRecording: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  amplitudeHistory: number[];
  filledBars: number;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onSend: () => void;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function VoiceMessage({
  isRecording,
  isPaused,
  elapsedSeconds,
  amplitudeHistory,
  filledBars,
  onPause,
  onResume,
  onCancel,
  onSend,
}: VoiceMessageProps) {
  if (!isRecording) return null;

  return (
    <div className="px-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-1.5">
          {!isPaused && (
            <span className="relative flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-alert-50" />
              <span className="relative inline-flex size-3 rounded-full bg-alert-500" />
            </span>
          )}
          <Typography.T3 weight="medium" className="text-gray-950">
            {isPaused ? 'Paused' : 'Recording'}
          </Typography.T3>
        </div>
        <Typography.T3>{formatTime(elapsedSeconds)}</Typography.T3>
      </div>

      <div className="w-full flex items-center gap-x-6">
        <Button
          size="icon-xs"
          className="bg-warning-500 rounded-full"
          icon="audio"
          onClick={isPaused ? onResume : onPause}
        />

        <div className="flex-1 flex items-center h-10">
          {amplitudeHistory.map((amplitude, i) => {
            const isFilled = i < filledBars;
            const minHeight = 0.08;
            const height = isFilled
              ? Math.max(minHeight, amplitude)
              : minHeight;

            return (
              <span
                key={i}
                className="flex-1 mx-px rounded-full transition-[height] duration-75"
                style={{
                  height: `${height * 100}%`,
                  backgroundColor: isFilled
                    ? 'var(--color-primary-500, #6366f1)'
                    : 'var(--color-gray-200, #e5e7eb)',
                }}
              />
            );
          })}
        </div>

        <div className="flex items-center gap-x-2.5">
          <Button
            size="icon-xs"
            className="bg-alert-500 rounded-full"
            icon="delete"
            onClick={onCancel}
          />
          <Button
            size="icon-xs"
            className="bg-primary-500 rounded-full"
            icon="tick"
            onClick={onSend}
          />
        </div>
      </div>
    </div>
  );
}
