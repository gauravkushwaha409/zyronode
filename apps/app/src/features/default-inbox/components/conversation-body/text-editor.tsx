import { Editor } from '@package/text-editor';
import type React from 'react';
import { useTextEditor } from '../../hooks/text-editor';
import { EnterToSendPlugin } from './enter-to-send-plugin';
import { InternalNotesBanner } from './internal-notes-banner';

type TextEditorWrapperProps = Pick<
  React.ComponentPropsWithRef<'div'>,
  'className' | 'ref'
>;
interface TextEditorProps extends TextEditorWrapperProps {
  conversationUUID: string;
  organizationId: string;
}

export function TextEditor({
  conversationUUID,
  organizationId,
  className,
  ref,
}: TextEditorProps) {
  const {
    effectiveMessageType,
    replyMessage,
    isReplyingToMessage,
    replyInternalNote,
    isReplyingToNote,
    setMessageType,
    editorRef,
    handleSend,
    handleClose,
    isPending,
    voice,
  } = useTextEditor({ conversationUUID, organizationId });

  return (
    <div
      ref={ref}
      className={`absolute bottom-0 inset-x-0 px-4 py-3 shrink-0 ${className}`}
    >
      <div
        className={`${effectiveMessageType === 'notes' ? 'bg-warning-50' : 'bg-transparent'}`}
      >
        {effectiveMessageType === 'notes' && <InternalNotesBanner />}

        <Editor
          onChange={(_editorState, editor) => {
            editorRef.current = editor;
          }}
          plugins={<EnterToSendPlugin onSubmit={handleSend} />}
          VoiceMessageProps={{
            isRecording: voice.isRecording,
            isPaused: voice.isPaused,
            elapsedSeconds: voice.elapsedSeconds,
            amplitudeHistory: voice.amplitudeHistory,
            filledBars: voice.filledBars,
            onPause: voice.onPause,
            onResume: voice.onResume,
            onCancel: voice.onCancel,
            onSend: voice.onSend,
          }}
          rightToolbarProps={{
            replyMenuPopoverProps: {
              requestEmail: { onClick: () => {} },
              workUpdate: { onClick: () => {} },
              requestFeedback: { onClick: () => {} },
              sendEmoji: { onClick: () => {} },
              addAttachment: { onClick: () => {} },
              knowledgeBase: { onClick: () => {} },
              autoComplete: { onClick: () => {} },
              shortcuts: { onClick: () => {} },
            },
            sendButtonProps: {
              onClick: handleSend,
              disabled: isPending,
            },
            audioButtonProps: {
              onClick: voice.onStart,
            },
          }}
          replyMessageProps={{
            message:
              replyMessage?.content ?? replyInternalNote?.content ?? '',
            isReplying: isReplyingToMessage || isReplyingToNote,
            onClick: handleClose,
          }}
          footerProps={{
            replyDropdownProps: {
              onNotesProps: {
                onClick: () => setMessageType('notes'),
              },
              onReplyProps: {
                onClick: () => setMessageType('reply'),
              },
              onValueChange: (value) => setMessageType(value),
              value: effectiveMessageType,
            },
            aiToolsDropdownProps: {
              onElaborateClick: { onClick: () => {} },
              onFixGrammarClick: { onClick: () => {} },
              onFormalToneClick: { onClick: () => {} },
              onFriendlyToneClick: { onClick: () => {} },
              onRephraseClick: { onClick: () => {} },
            },
          }}
        />
      </div>
    </div>
  );
}
