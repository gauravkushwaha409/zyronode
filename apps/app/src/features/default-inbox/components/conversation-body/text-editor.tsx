import { Editor } from '@package/text-editor';
import { InputFile, toast } from '@package/ui';
import type React from 'react';
import { useTextEditor } from '../../hooks/text-editor';
import { EnterToSendPlugin } from './enter-to-send-plugin';
import { InternalNotesBanner } from './internal-notes-banner';

const FILE_ACCEPT_STRING =
  'image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip';
const MAX_FILES_PER_UPLOAD = 5;

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
    fileUpload,
  } = useTextEditor({ conversationUUID, organizationId });

  const isNotesMode = effectiveMessageType === 'notes';

  return (
    <div
      ref={ref}
      className={`absolute bottom-0 inset-x-0 px-4 py-3 shrink-0 ${className}`}
    >
      <InputFile
        dropzoneOptions={{
          noClick: true,
          noKeyboard: true,
          disabled: isNotesMode,
          onDrop: async (acceptedFiles, fileRejections) => {
            if (isNotesMode) {
              toast.error('File upload is disabled in notes mode');
              return;
            }
            if (acceptedFiles.length + fileRejections.length > MAX_FILES_PER_UPLOAD) {
              toast.error(`You can upload a maximum of ${MAX_FILES_PER_UPLOAD} files at once.`);
              return;
            }
            await fileUpload.handleFilesDrop(acceptedFiles);
          },
        }}
        customComponent={({ getInputProps, isDragActive }) => (
          <div className="relative">
            {/* Drag & drop input — noClick/noKeyboard so it never opens the file picker */}
            <input {...getInputProps()} />

            {/* Hidden input triggered by the "Add attachment" toolbar button */}
            <input
              ref={fileUpload.fileInputRef}
              type="file"
              onChange={fileUpload.handleFileSelect}
              hidden
              multiple
              accept={FILE_ACCEPT_STRING}
            />

            {isDragActive && (
              <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg border-2 border-dashed border-primary-400 bg-primary-50/80 backdrop-blur-sm">
                <p className="text-primary-600 font-medium">Drop files here</p>
              </div>
            )}

            <div
              className={`${isNotesMode ? 'bg-warning-50' : 'bg-transparent'}`}
            >
              {isNotesMode && <InternalNotesBanner />}

              <Editor
                onChange={(_editorState, editor) => {
                  editorRef.current = editor;
                }}
                plugins={<EnterToSendPlugin onSubmit={handleSend} />}
                attachments={fileUpload.attachments}
                onAttachmentsChange={fileUpload.setAttachments}
                isUploading={fileUpload.isUploading}
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
                    addAttachment: {
                      onClick: () => {
                        if (isNotesMode) {
                          toast.error('File upload is disabled in notes mode');
                          return;
                        }
                        fileUpload.handleAttachmentClick();
                      },
                    },
                    knowledgeBase: { onClick: () => {} },
                    autoComplete: { onClick: () => {} },
                    shortcuts: { onClick: () => {} },
                  },
                  sendButtonProps: {
                    onClick: handleSend,
                    disabled: isPending || fileUpload.isUploading,
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
        )}
      />
    </div>
  );
}
