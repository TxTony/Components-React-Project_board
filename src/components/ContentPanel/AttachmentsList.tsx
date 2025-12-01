/**
 * AttachmentsList Component
 * Display list of attachments with download and remove actions
 */

import React from 'react';
import type { Attachment } from '@/types';

export interface AttachmentsListProps {
  attachments: Attachment[];
  onRemove?: (attachmentId: string) => void;
  onDownload?: (attachment: Attachment) => void;
}

export const AttachmentsList: React.FC<AttachmentsListProps> = ({
  attachments,
  onRemove,
  onDownload,
}) => {
  if (attachments.length === 0) {
    return (
      <div className="gitboard-attachments-list__empty text-sm text-gray-500 dark:text-gray-400 italic">
        No attachments
      </div>
    );
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mime: string): string => {
    if (mime.startsWith('image/')) return '🖼️';
    if (mime.startsWith('video/')) return '🎥';
    if (mime.startsWith('audio/')) return '🎵';
    if (mime.includes('pdf')) return '📄';
    if (mime.includes('zip') || mime.includes('compressed')) return '📦';
    return '📎';
  };

  const handleDownload = (attachment: Attachment) => {
    if (onDownload) {
      onDownload(attachment);
    } else {
      // Default download behavior
      window.open(attachment.url, '_blank');
    }
  };

  return (
    <div className="gitboard-attachments-list space-y-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="gitboard-attachment-item flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {/* Icon */}
          <div className="gitboard-attachment-item__icon text-2xl">
            {getFileIcon(attachment.mime)}
          </div>

          {/* Info */}
          <div className="gitboard-attachment-item__info flex-1 min-w-0">
            <div className="gitboard-attachment-item__name font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
              {attachment.filename}
            </div>
            <div className="gitboard-attachment-item__meta text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(attachment.size)} • {new Date(attachment.uploadedAt).toLocaleDateString()}
            </div>
          </div>

          {/* Actions */}
          <div className="gitboard-attachment-item__actions flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownload(attachment)}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              title="Download"
              aria-label={`Download ${attachment.filename}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(attachment.id)}
                className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                title="Remove"
                aria-label={`Remove ${attachment.filename}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

AttachmentsList.displayName = 'AttachmentsList';
