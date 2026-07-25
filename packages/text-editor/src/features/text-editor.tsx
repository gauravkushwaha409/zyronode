import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { Button, Icon, Typography } from '@package/ui';
import { useCallback } from 'react';
import type { Attachment } from '../editor';
import { AttachPreview } from '../preview/image-preview';
import { VoicePreview } from '../preview/voice-preview';
import { ReplyMenuPopover } from './reply-menu-popover';

export interface TextEditorProps {
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  attachments?: Attachment[];
  onAttachmentsChange?: (attachments: Attachment[]) => void;
  isUploading?: boolean;
  rightToolbarProps: RightSideToolbarProps;
}

export function TextEditor({
  placeholder = 'Type here...',
  onKeyDown,
  attachments: externalAttachments,
  onAttachmentsChange,
  isUploading,
  rightToolbarProps,
}: TextEditorProps) {
  const handleRemoveAttachment = useCallback(
    (index: number) => {
      if (!externalAttachments || !onAttachmentsChange) return;
      onAttachmentsChange(externalAttachments.filter((_, i) => i !== index));
    },
    [externalAttachments, onAttachmentsChange],
  );

  const attachments = externalAttachments ?? [];

  return (
    <div className="min-h-0 px-3 pt-2.5 pb-3.5 grid grid-cols-[1fr_auto] overflow-hidden gap-x-7">
      <div className="space-y-5 overflow-y-auto scrollbar-hover">
        <RichTextPlugin
          contentEditable={
            <div className="relative flex items-center justify-between">
              <ContentEditable
                className="outline-none overflow-auto scrollbar-none w-full"
                aria-placeholder={placeholder}
                onKeyDown={onKeyDown}
                placeholder={
                  <div className="absolute top-0 left-0 pointer-events-none">
                    <Typography.T3 className="font-normal text-gray-400">
                      {placeholder}
                    </Typography.T3>
                  </div>
                }
              />
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        {(attachments.length > 0 || isUploading) && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment, index) =>
              attachment.type === 'audio' ? (
                <VoicePreview
                  key={attachment.url}
                  attachment={attachment}
                  onRemove={() => handleRemoveAttachment(index)}
                />
              ) : (
                <AttachPreview
                  key={attachment.url}
                  attachment={attachment}
                  onRemove={() => handleRemoveAttachment(index)}
                />
              ),
            )}
            {isUploading && (
              <div className="w-14 h-14 rounded-[6px] flex items-center justify-center bg-gray-100">
                <Icon name="file" size={16} className="text-gray-400" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-end">
        <RightSideToolbar {...rightToolbarProps} />
      </div>
    </div>
  );
}

type ReplyMenuPopoverProps = React.ComponentProps<typeof ReplyMenuPopover>;
export interface RightSideToolbarProps {
  replyMenuPopoverProps: ReplyMenuPopoverProps;
  sendButtonProps?: Pick<
    React.ComponentProps<typeof Button>,
    'onClick' | 'disabled'
  >;
  closeButtonProps?: Pick<
    React.ComponentProps<typeof Button>,
    'onClick' | 'disabled'
  >;
  audioButtonProps?: Pick<
    React.ComponentProps<typeof Button>,
    'onClick'
  >;
}
function RightSideToolbar({
  replyMenuPopoverProps,
  sendButtonProps,
  closeButtonProps,
  audioButtonProps,
}: RightSideToolbarProps) {
  return (
    <div className="flex items-center gap-x-2.5">
      <div className="flex items-center">
        <Button icon="formatting" size="icon-sm" variant="ghost" />
        <Button
          icon="audio"
          size="icon-sm"
          variant="ghost"
          {...audioButtonProps}
        />
        <ReplyMenuPopover {...replyMenuPopoverProps} />
      </div>
      <div className="flex items-center gap-x-2.5">
        {closeButtonProps && (
          <Button
            icon="close"
            size="icon-sm"
            variant="ghost"
            {...closeButtonProps}
          />
        )}
        <Button
          icon="send"
          size="icon-sm"
          variant="default"
          {...sendButtonProps}
        />
      </div>
    </div>
  );
}
