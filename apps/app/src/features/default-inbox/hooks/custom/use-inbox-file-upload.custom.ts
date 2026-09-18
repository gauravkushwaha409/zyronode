import type { Attachment } from '@package/text-editor';
import { toast } from '@package/ui';
import { useCallback, useRef, useState } from 'react';
import { useUploadInboxFileMutation } from '../mutations/use-upload-inbox-file.mutation';

const MAX_FILES_PER_UPLOAD = 5;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB, matches the server's cap

interface UseInboxFileUploadOptions {
  conversationId: string;
  organizationId: string;
}

function attachmentTypeFromMimeType(mimeType: string): Attachment['type'] {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'file';
}

let attachmentIdCounter = 0;

export function useInboxFileUpload({
  conversationId,
  organizationId,
}: UseInboxFileUploadOptions) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { mutateAsync: uploadFile } = useUploadInboxFileMutation(
    conversationId,
    organizationId,
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const oversized = files.find((file) => file.size > MAX_FILE_SIZE_BYTES);
      if (oversized) {
        toast.error(`"${oversized.name}" is over the 10MB upload limit.`);
        return;
      }

      setIsUploading(true);
      try {
        const uploaded = await Promise.all(
          files.map(async (file) => {
            const response = await uploadFile(file);
            const data = response.data.data;
            const attachment: Attachment = {
              id: ++attachmentIdCounter,
              url: data.url,
              name: data.filename,
              type: attachmentTypeFromMimeType(data.mimeType),
            };
            return attachment;
          }),
        );
        setAttachments((prev) => [...prev, ...uploaded]);
      } catch {
        toast.error('Failed to upload file. Please try again.');
      } finally {
        setIsUploading(false);
      }
    },
    [uploadFile],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      e.target.value = ''; // allow re-selecting the same file
      if (files.length > MAX_FILES_PER_UPLOAD) {
        toast.error(`You can upload a maximum of ${MAX_FILES_PER_UPLOAD} files at once.`);
        return;
      }
      void uploadFiles(files);
    },
    [uploadFiles],
  );

  const handleFilesDrop = useCallback(
    async (files: File[]) => {
      if (files.length > MAX_FILES_PER_UPLOAD) {
        toast.error(`You can upload a maximum of ${MAX_FILES_PER_UPLOAD} files at once.`);
        return;
      }
      await uploadFiles(files);
    },
    [uploadFiles],
  );

  const handleAttachmentClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    attachments,
    setAttachments,
    isUploading,
    fileInputRef,
    handleFileSelect,
    handleFilesDrop,
    handleAttachmentClick,
  };
}
