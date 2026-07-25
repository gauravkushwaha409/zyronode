import { ListItemNode, ListNode } from '@lexical/list';
import type { InitialConfigType } from '@lexical/react/LexicalComposer';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { Button, cn } from '@package/ui';
import type { EditorState, LexicalEditor } from 'lexical';
import { useState } from 'react';
import { AiToolsDropdown } from './features/ai-tools-dropdown';
import { ReplyDropdown } from './features/reply-dropdown';
import type { RightSideToolbarProps } from './features/text-editor';
import { TextEditor } from './features/text-editor';
import { VoiceMessage } from './features/voice-message';
import { editorTheme } from './theme';

export interface Attachment {
  id: number;
  url: string;
  name: string;
  type: 'image' | 'video' | 'file' | 'audio';
}

export interface EditorProps {
  onChange?: (
    editorState: EditorState,
    editor: LexicalEditor,
    tags: Set<string>,
  ) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  initialConfig?: Partial<InitialConfigType>;
  rightToolbarProps: RightSideToolbarProps;
  footerProps: React.ComponentProps<typeof TextEditorFooter>;
  attachments?: Attachment[];
  onAttachmentsChange?: (attachments: Attachment[]) => void;
  isUploading?: boolean;
  replyMessageProps: React.ComponentProps<typeof ReplyMessageUI>;
  plugins?: React.ReactNode;
  VoiceMessageProps?: React.ComponentProps<typeof VoiceMessage>;
}

export function Editor({
  onChange,
  onKeyDown,
  placeholder = 'Type here...',
  initialConfig,
  rightToolbarProps,
  footerProps,
  attachments: externalAttachments,
  onAttachmentsChange,
  isUploading,
  replyMessageProps,
  plugins,
  VoiceMessageProps = {} as React.ComponentProps<typeof VoiceMessage>,
}: EditorProps) {
  const [internalAttachments, setInternalAttachments] = useState<Attachment[]>(
    [],
  );
  const attachments = externalAttachments ?? internalAttachments;

  const handleAttachmentsChange = (newAttachments: Attachment[]) => {
    if (onAttachmentsChange) {
      onAttachmentsChange(newAttachments);
    } else {
      setInternalAttachments(newAttachments);
    }
  };

  const config: InitialConfigType = {
    namespace: 'editor',
    theme: editorTheme,
    nodes: [ListNode, ListItemNode],
    onError: (error: Error) => {
      console.error(error);
    },
    ...initialConfig,
  };

  return (
    <LexicalComposer initialConfig={config}>
      <div className="max-h-52.5 grid grid-rows-[1fr_auto] border border-gray-300 rounded-[12px] overflow-hidden bg-white text-editor-shadow">
        <div className="rounded-b-[12px] grid grid-rows-[1fr] overflow-hidden px-1 pt-1 outline outline-gray-200">
          <ReplyMessageUI {...replyMessageProps} />

          {!VoiceMessageProps.isRecording && (
            <TextEditor
              placeholder={placeholder}
              {...(onKeyDown !== undefined && { onKeyDown })}
              {...(isUploading !== undefined && { isUploading })}
              attachments={attachments}
              onAttachmentsChange={handleAttachmentsChange}
              rightToolbarProps={rightToolbarProps}
            />
          )}

          {VoiceMessageProps.isRecording && (
            <VoiceMessage {...VoiceMessageProps} />
          )}
        </div>

        <TextEditorFooter {...footerProps} />

        {plugins}
        <HistoryPlugin />
        <ListPlugin />
        {onChange && (
          <OnChangePlugin
            onChange={(editorState, editor, tags) =>
              onChange(editorState, editor, tags)
            }
          />
        )}
      </div>
    </LexicalComposer>
  );
}

type ReplyDropdownProps = React.ComponentProps<typeof ReplyDropdown>;
type AiToolsDropdownProps = React.ComponentProps<typeof AiToolsDropdown>;
interface TextEditorFooterProps {
  replyDropdownProps: ReplyDropdownProps;
  aiToolsDropdownProps: AiToolsDropdownProps;
}
function TextEditorFooter({
  replyDropdownProps,
  aiToolsDropdownProps,
}: TextEditorFooterProps) {
  return (
    <div className="w-full px-4 py-2.5 flex items-center justify-between gap-x-2">
      <div className="flex items-center gap-x-2">
        <ReplyDropdown {...replyDropdownProps} />

        <button
          type="button"
          className={cn(
            'typo-t5 font-medium',
            ' text-gray-950 bg-linear-to-b bg-gray-50',
            'flex items-center gap-x-1',
            'px-2.5 py-1 rounded-[6px]',
          )}
        >
          Quick Response
        </button>

        <button
          type="button"
          className={cn(
            'typo-t5 font-medium',
            ' text-gray-950 bg-linear-to-b bg-gray-50',
            'flex items-center gap-x-1',
            'px-2.5 py-1 rounded-[6px]',
          )}
        >
          Set Reminder
        </button>

        <AiToolsDropdown {...aiToolsDropdownProps} />
      </div>
      <button
        type="button"
        className={cn(
          'typo-t5 font-medium',
          'bg-[linear-gradient(180deg,#7C3AED_0%,#472187_100%)] bg-clip-text text-transparent',
          'flex items-center gap-x-1',
          'px-2.5 py-1 rounded-full',
          'border border-primary-100',
        )}
      >
        AI Suggest
      </button>
    </div>
  );
}

type ButtonProps = Pick<React.ComponentProps<typeof Button>, 'onClick'>;
interface ReplyMessageUIProps extends ButtonProps {
  message: string;
  isReplying?: boolean;
}
function ReplyMessageUI({ message, isReplying, onClick }: ReplyMessageUIProps) {
  return isReplying ? (
    <div className="text-gray-500 bg-gray-50 w-full px-3 py-2.5 rounded-[8px] flex items-center gap-x-2.5">
      <div
        className=" flex-1"
        dangerouslySetInnerHTML={{
          __html: message,
        }}
      />
      <Button
        icon="close"
        variant={'ghost'}
        size={'icon-sm'}
        onClick={onClick}
      />
    </div>
  ) : null;
}
