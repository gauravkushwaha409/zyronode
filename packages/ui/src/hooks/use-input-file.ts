import { type DropzoneOptions, useDropzone } from 'react-dropzone';

export function useInputFile(props?: DropzoneOptions) {
  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    onDrop: (acceptedfile, rejectedfiles, event) => {
      props?.onDrop?.(acceptedfile, rejectedfiles, event);
    },
  });

  return { getInputProps, getRootProps, isDragActive };
}
