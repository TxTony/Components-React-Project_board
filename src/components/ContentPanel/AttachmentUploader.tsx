/**
 * AttachmentUploader Component
 * File upload component for attachments
 */

import React, { useRef, useState } from 'react';
import { Button } from '../Shared';
import type { Attachment } from '@/types';

export interface AttachmentUploaderProps {
  onUpload?: (attachment: Attachment) => void;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
}

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  onUpload,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ['*/*'], // Accept all files by default
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size exceeds maximum of ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    // Validate file type
    if (acceptedTypes.length > 0 && !acceptedTypes.includes('*/*')) {
      const fileType = file.type;
      const isAccepted = acceptedTypes.some((type) => {
        if (type.endsWith('/*')) {
          return fileType.startsWith(type.replace('/*', ''));
        }
        return fileType === type;
      });

      if (!isAccepted) {
        setError('File type not accepted');
        return;
      }
    }

    setError(null);
    setIsUploading(true);

    try {
      // Simulate upload (in production, this would upload to a server)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create URL for the file
      const url = URL.createObjectURL(file);

      const attachment: Attachment = {
        id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        filename: file.name,
        mime: file.type,
        size: file.size,
        url: url,
        uploadedAt: new Date().toISOString(),
      };

      if (onUpload) {
        onUpload(attachment);
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="gitboard-attachment-uploader">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept={acceptedTypes.join(',')}
        disabled={isUploading}
      />

      <Button
        variant="secondary"
        size="sm"
        onClick={handleButtonClick}
        disabled={isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Uploading...
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Upload file
          </>
        )}
      </Button>

      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</div>
      )}
    </div>
  );
};

AttachmentUploader.displayName = 'AttachmentUploader';
