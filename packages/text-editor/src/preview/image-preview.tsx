import { Avatar, Button, Icon, cn } from '@package/ui';
import type { Attachment } from '../editor';

interface AttachPreviewProps {
  attachment: Attachment;
  onRemove: () => void;
}

export function AttachPreview({ attachment, onRemove }: AttachPreviewProps) {
  return (
    <div className="relative w-fit">
      {attachment.type === 'image' ? (
        <Avatar
          key={`avatar-${attachment.url}`}
          size="2xl"
          image={attachment.url}
          imageClassName="rounded-[6px]"
        />
      ) : attachment.type === 'video' ? (
        <video
          src={attachment.url}
          className="w-24 h-24 object-cover rounded-[6px]"
          controls
        />
      ) : (
        <div className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded-[6px] border border-gray-200">
          <Icon name="file" size={16} className="text-gray-500" />
        </div>
      )}

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
