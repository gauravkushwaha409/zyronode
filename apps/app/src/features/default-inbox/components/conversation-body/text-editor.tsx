import {
  $createParagraphNode,
  $createTextNode,
  $generateNodesFromDOM,
  $getRoot,
  $getSelection,
  $isDecoratorNode,
  $isElementNode,
  $isRangeSelection,
  Editor,
  type LexicalEditor,
  useEditor,
} from '@package/text-editor';
import { InputFile, toast } from '@package/ui';
import type React from 'react';
import { useEffect } from 'react';
import { useAiRewriteMutation, useAiSuggestReplyMutation } from '../../hooks/mutations';
import { useTextEditor } from '../../hooks/text-editor';
import type { AiTypes } from '../../types/ai-api.types';
import { EnterToSendPlugin } from './enter-to-send-plugin';
import { InternalNotesBanner } from './internal-notes-banner';

const FILE_ACCEPT_STRING =
  'image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip';
const MAX_FILES_PER_UPLOAD = 5;

function readEditorText(editor: LexicalEditor): string {
  let text = '';
  editor.read(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection) && !selection.isCollapsed()) {
      text = selection.getTextContent();
    } else {
      text = $getRoot().getTextContent();
    }
  });
  return text.trim();
}

function writeEditorText(
  editor: LexicalEditor,
  text: string,
  replaceWholeDocument: boolean,
) {
  editor.update(() => {
    const selection = $getSelection();
    if (
      !replaceWholeDocument &&
      $isRangeSelection(selection) &&
      !selection.isCollapsed()
    ) {
      selection.insertText(text);
      return;
    }
    const root = $getRoot();
    root.clear();
    const paragraph = $createParagraphNode();
    paragraph.append($createTextNode(text));
    root.append(paragraph);
  });
}

function EditorRefCapture({
  onReady,
}: {
  onReady: (editor: LexicalEditor) => void;
}) {
  const editor = useEditor();
  useEffect(() => {
    onReady(editor);
  }, [editor, onReady]);
  return null;
}

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
    editingMessage,
    setMessageType,
    editorRef,
    handleSend,
    handleClose,
    isPending,
    voice,
    fileUpload,
  } = useTextEditor({ conversationUUID, organizationId });

  const { mutate: rewriteDraft, isPending: isRewriting } =
    useAiRewriteMutation();
  const { mutate: suggestReply, isPending: isSuggesting } =
    useAiSuggestReplyMutation();
  const isAiPending = isRewriting || isSuggesting;

  const runRewrite = (action: AiTypes.AiAction) => {
    if (isAiPending) return;
    const editor = editorRef.current;
    if (!editor) {
      toast.error('Click in the message box first');
      return;
    }
    const text = readEditorText(editor);
    if (!text) {
      toast.error('Write a message first');
      return;
    }
    rewriteDraft(
      { text, action },
      {
        onSuccess: (response) => {
          const result = response.data?.data?.text;
          if (!result) return;
          writeEditorText(editor, result, false);
        },
        onError: () => {
          toast.error('AI could not process that. Please try again.');
        },
      },
    );
  };

  const runSuggestReply = () => {
    if (isAiPending) return;
    const editor = editorRef.current;
    if (!editor) {
      toast.error('Click in the message box first');
      return;
    }
    suggestReply(
      { conversationId: conversationUUID, organizationId },
      {
        onSuccess: (response) => {
          const result = response.data?.data?.text;
          if (!result) return;
          writeEditorText(editor, result, true);
        },
        onError: () => {
          toast.error('Could not generate a reply. Please try again.');
        },
      },
    );
  };

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
                key={editingMessage?.uuid ?? 'new'}
                initialConfig={
                  editingMessage
                    ? {
                        editorState: (editor) => {
                          editor.update(() => {
                            const dom = new DOMParser().parseFromString(
                              editingMessage.content,
                              'text/html',
                            );
                            const nodes = $generateNodesFromDOM(editor, dom);
                            const root = $getRoot();
                            root.clear();
                            const rootChildren = nodes.every(
                              (node) => $isElementNode(node) || $isDecoratorNode(node),
                            )
                              ? nodes
                              : [$createParagraphNode().append(...nodes)];
                            root.append(...rootChildren);
                          });
                        },
                      }
                    : undefined
                }
                onChange={(_editorState, editor) => {
                  editorRef.current = editor;
                }}
                plugins={
                  <>
                    <EnterToSendPlugin onSubmit={handleSend} />
                    <EditorRefCapture
                      onReady={(editor) => {
                        editorRef.current = editor;
                      }}
                    />
                  </>
                }
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
                  ...(editingMessage && {
                    closeButtonProps: { onClick: handleClose },
                  }),
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
                    onSuggestReplyClick: { onClick: runSuggestReply },
                    onElaborateClick: { onClick: () => runRewrite('elaborate') },
                    onFixGrammarClick: { onClick: () => runRewrite('fix_grammar') },
                    onFormalToneClick: { onClick: () => runRewrite('formal') },
                    onFriendlyToneClick: { onClick: () => runRewrite('friendly') },
                    onRephraseClick: { onClick: () => runRewrite('rephrase') },
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
