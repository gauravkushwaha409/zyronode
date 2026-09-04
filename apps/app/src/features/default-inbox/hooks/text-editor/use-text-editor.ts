import type { LexicalEditor } from '@package/text-editor';
import { $generateHtmlFromNodes, $getRoot } from '@package/text-editor';
import { useCallback, useRef, useState } from 'react';
import {
  useInternalNoteReplyStore,
  useMessageReplyStore,
} from '../../store';
import { useSendAgentMessageMutation } from '../mutations/use-send-agent-message.mutation';
import { useVoiceRecorder } from '../use-voice-recorder';

interface UseTextEditorOptions {
  conversationUUID: string;
  organizationId: string;
}

export function useTextEditor({
  conversationUUID,
  organizationId,
}: UseTextEditorOptions) {
  const [messageType, setMessageType] = useState<'reply' | 'notes'>('reply');
  const editorRef = useRef<LexicalEditor | null>(null);
  const voice = useVoiceRecorder();

  const { mutate: sendMessage, isPending: isSendingMessage } =
    useSendAgentMessageMutation(organizationId);

  const {
    message: replyMessage,
    isReplying,
    clearMessage: cancelReply,
  } = useMessageReplyStore();

  const {
    message: replyInternalNote,
    isReplying: isReplyingInternalNote,
    clearMessage: cancelInternalNoteReply,
  } = useInternalNoteReplyStore();

  const isReplyingToMessage = isReplying(replyMessage?.uuid ?? '');
  const isReplyingToNote = isReplyingInternalNote(replyInternalNote?.uuid ?? '');

  const resetEditor = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.update(() => {
      $getRoot().clear();
    });
  }, []);

  const handleSend = useCallback(() => {
    const editor = editorRef.current;
    if (!conversationUUID || !editor) return;

    editor.read(() => {
      const htmlContent = $generateHtmlFromNodes(editor);
      const isEmpty = $getRoot().getTextContentSize() === 0;

      if (isEmpty) return;

      const isInternalNote = messageType === 'notes';
      const replyToId = replyMessage?.uuid ?? replyInternalNote?.uuid ?? undefined;

      sendMessage(
        {
          conversationId: conversationUUID,
          content: htmlContent,
          messageType: isInternalNote ? 'INTERNAL_NOTE' : 'TEXT',
          ...(replyToId && { replyToId }),
        },
        {
          onSuccess: () => {
            if (isReplyingToMessage) cancelReply();
            if (isReplyingToNote) cancelInternalNoteReply();
            resetEditor();
          },
        },
      );
    });
  }, [
    conversationUUID,
    messageType,
    replyMessage,
    replyInternalNote,
    isReplyingToMessage,
    isReplyingToNote,
    sendMessage,
    cancelReply,
    cancelInternalNoteReply,
    resetEditor,
  ]);

  const handleClose = useCallback(() => {
    if (isReplyingToMessage) cancelReply();
    if (isReplyingToNote) cancelInternalNoteReply();
  }, [isReplyingToMessage, isReplyingToNote, cancelReply, cancelInternalNoteReply]);

  const handleVoiceSend = useCallback(async () => {
    if (!conversationUUID) return;
    const result = await voice.stopAndGetBlob();
    const blob = result?.blob ?? voice.audioBlob;
    const url = result?.url ?? voice.audioUrl;
    if (!blob) return;
    const finalUrl = url ?? URL.createObjectURL(blob);
    const isInternalNote = messageType === 'notes';
    sendMessage(
      {
        content: `<audio controls src="${finalUrl}"></audio>`,
        messageType: isInternalNote ? 'INTERNAL_NOTE' : 'TEXT',
        ...(replyMessage?.uuid && { replyToId: replyMessage.uuid }),
        ...(!replyMessage?.uuid && replyInternalNote?.uuid && { replyToId: replyInternalNote.uuid }),
      },
      {
        onSuccess: () => {
          voice.reset();
          if (isReplyingToMessage) cancelReply();
          if (isReplyingToNote) cancelInternalNoteReply();
        },
      },
    );
  }, [conversationUUID, voice, messageType, replyMessage, replyInternalNote, isReplyingToMessage, isReplyingToNote, sendMessage, cancelReply, cancelInternalNoteReply]);

  return {
    messageType,
    setMessageType,
    effectiveMessageType: messageType,
    replyMessage: isReplyingToMessage ? replyMessage : null,
    isReplyingToMessage,
    cancelReply: handleClose,
    replyInternalNote: isReplyingToNote ? replyInternalNote : null,
    isReplyingToNote,
    cancelInternalNoteReply: handleClose,
    editorRef,
    handleSend,
    handleClose,
    isPending: isSendingMessage,
    voice: {
      isRecording: voice.isRecording,
      isPaused: voice.isPaused,
      elapsedSeconds: voice.elapsedSeconds,
      amplitudeHistory: voice.amplitudeHistory,
      filledBars: voice.filledBars,
      onPause: voice.pause,
      onResume: voice.resume,
      onCancel: voice.cancel,
      onSend: handleVoiceSend,
      onStart: voice.start,
    },
  };
}
