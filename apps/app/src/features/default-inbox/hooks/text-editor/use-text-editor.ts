import type { LexicalEditor } from '@package/text-editor';
import { $generateHtmlFromNodes, $getRoot } from '@package/text-editor';
import { useCallback, useRef, useState } from 'react';
import {
  useInternalNoteReplyStore,
  useMessageReplyStore,
} from '../../store';
import { useInboxFileUpload } from '../custom';
import { useSendAgentMessageMutation } from '../mutations/use-send-agent-message.mutation';
import { useSendInternalNoteMutation } from '../mutations/use-send-internal-note.mutation';
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
  const fileUpload = useInboxFileUpload({
    conversationId: conversationUUID,
    organizationId,
  });

  const { mutate: sendMessage, isPending: isSendingMessage } =
    useSendAgentMessageMutation(organizationId);
  const { mutate: sendInternalNote, isPending: isSendingInternalNote } =
    useSendInternalNoteMutation(organizationId);

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

    let htmlContent = '';
    let isEmpty = true;
    editor.read(() => {
      htmlContent = $generateHtmlFromNodes(editor);
      isEmpty = $getRoot().getTextContentSize() === 0;
    });

    const attachmentsToSend = fileUpload.attachments;
    if (isEmpty && attachmentsToSend.length === 0) return;

    const isInternalNote = messageType === 'notes';
    const replyToId = replyMessage?.uuid ?? replyInternalNote?.uuid ?? undefined;

    const finishSend = () => {
      if (isReplyingToMessage) cancelReply();
      if (isReplyingToNote) cancelInternalNoteReply();
      resetEditor();
    };

    // Each attachment is its own FILE message — the backend stores a
    // message's content as a single string (the file URL), it doesn't
    // support multiple files per message.
    fileUpload.setAttachments([]);
    attachmentsToSend.forEach((attachment) => {
      sendMessage({
        conversationId: conversationUUID,
        content: attachment.url,
        messageType: 'FILE',
      });
    });

    if (isEmpty) {
      finishSend();
      return;
    }

    if (isInternalNote) {
      sendInternalNote(
        {
          conversationId: conversationUUID,
          content: htmlContent,
          ...(replyToId && { replyToId }),
        },
        { onSuccess: finishSend },
      );
      return;
    }

    sendMessage(
      {
        conversationId: conversationUUID,
        content: htmlContent,
        messageType: 'TEXT',
        ...(replyToId && { replyToId }),
      },
      { onSuccess: finishSend },
    );
  }, [
    conversationUUID,
    messageType,
    replyMessage,
    replyInternalNote,
    isReplyingToMessage,
    isReplyingToNote,
    sendMessage,
    sendInternalNote,
    cancelReply,
    cancelInternalNoteReply,
    resetEditor,
    fileUpload,
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
        conversationId: conversationUUID,
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
    isPending: isSendingMessage || isSendingInternalNote,
    fileUpload,
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
