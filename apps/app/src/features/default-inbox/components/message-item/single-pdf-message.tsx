import { Typography } from '@package/ui';
import { format, parseISO } from 'date-fns';
import type { ConversationMessageTypes } from '../../types';

interface MessageTypePdfProps {
  message: ConversationMessageTypes.ConversationMessage;
}

export function MessageTypePdf({ message }: MessageTypePdfProps) {
  return (
    <div className="p-0.5 rounded-t-[6px] rounded-bl-[6px] w-62.5 bg-primary-400">
      <div className="rounded-lg p-1 backdrop-blur-[15px] bg-white/15">
        <div className="w-full h-20 bg-gray-200 flex items-center justify-center">
          <Typography.T5 className="text-gray-500">PDF Preview</Typography.T5>
        </div>
        <div className="px-3 py-2.5 backdrop-blur-[10px] bg-primary-300">
          <div className="flex flex-col items-start">
            <Typography.T5 weight="medium" className="text-white">
              {message?.attachments?.[0]?.filename ?? 'document.pdf'}
            </Typography.T5>
            <div className="flex items-center gap-x-0.5 text-primary-100">
              <Typography.Cap weight="regular" className="text-primary-100">
                PDF Document
              </Typography.Cap>
            </div>
          </div>
        </div>
      </div>
      <div className="p-2 space-y-1.5">
        <div className="">
          <Typography.Cap weight="medium" className="w-fit ml-auto text-primary-100">
            {message.status === 'read' && 'Seen'}
            {message.status === 'read' && ' . '}
            {format(parseISO(message.created_at), 'h:mm a')}
          </Typography.Cap>
        </div>
      </div>
    </div>
  );
}
