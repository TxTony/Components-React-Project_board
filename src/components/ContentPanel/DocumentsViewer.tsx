/**
 * DocumentsViewer Component
 * Displays embedded documents (PDFs, images, etc.)
 */

import React from 'react';
import { Button } from '../Shared';
import type { Document } from '@/types';

export interface DocumentsViewerProps {
  documents: Document[];
  onChange: (documents: Document[]) => void;
}

export const DocumentsViewer: React.FC<DocumentsViewerProps> = ({ documents, onChange }) => {
  const handleDelete = (documentId: string) => {
    onChange(documents.filter((doc) => doc.id !== documentId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mime: string) => {
    if (mime.startsWith('image/')) {
      return (
        <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      );
    }
    if (mime === 'application/pdf') {
      return (
        <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    );
  };

  if (documents.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
        No documents attached
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Documents
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Thumbnail or Icon */}
              <div className="flex-shrink-0">
                {doc.thumbnail ? (
                  <img
                    src={doc.thumbnail}
                    alt={doc.filename}
                    className="h-16 w-16 object-cover rounded border border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="h-16 w-16 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded text-gray-400 dark:text-gray-500">
                    {getFileIcon(doc.mime)}
                  </div>
                )}
              </div>

              {/* Document Info */}
              <div className="flex-1 min-w-0">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 block truncate"
                >
                  {doc.filename}
                </a>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(doc.size)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View
                  </a>
                  <a
                    href={doc.url}
                    download={doc.filename}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Download
                  </a>
                </div>
              </div>

              {/* Delete Button */}
              <Button
                onClick={() => handleDelete(doc.id)}
                variant="ghost"
                size="sm"
                aria-label="Delete document"
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

DocumentsViewer.displayName = 'DocumentsViewer';
