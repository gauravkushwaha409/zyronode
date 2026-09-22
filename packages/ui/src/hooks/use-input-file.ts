import { type DropzoneOptions, useDropzone } from 'react-dropzone';

export function useInputFile(props?: DropzoneOptions) {
  const { getInputProps, getRootProps, isDragActive } = useDropzone(props);

  return { getInputProps, getRootProps, isDragActive };
}
