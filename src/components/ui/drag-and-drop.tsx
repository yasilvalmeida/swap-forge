import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { UploadCloud, ImageIcon, File } from 'lucide-react';

interface DragAndDropProps {
  onFileUpload: (file: File) => void;
}

export function DragAndDrop({ onFileUpload }: DragAndDropProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0]);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-500 bg-gray-800 p-4 text-center ${
        isDragActive ? 'border-yellow-400 bg-gray-700' : ''
      }`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <>
          <UploadCloud className='mb-2 h-14 w-14 text-yellow-400' />
          <p className='text-yellow-400'>Drop the image here...</p>
        </>
      ) : (
        <>
          <ImageIcon className='mb-2 h-8 w-8 text-gray-400' />
          <p className='text-gray-400'>
            Drag & drop, or click to select
          </p>
          <p className='text-xs mt-2 text-gray-500'>
            Only JPEG and PNG files are allowed
          </p>
          <Button type='button' variant='default' className='mt-4'>
            <File className='mr-2 h-4 w-4' />
            Browse Files
          </Button>
        </>
      )}
    </div>
  );
}
