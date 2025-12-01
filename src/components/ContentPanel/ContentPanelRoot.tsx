/**
 * ContentPanelRoot Component
 * Side panel for viewing and editing row content (markdown + attachments)
 */

import React from 'react';
import { MarkdownEditor } from './MarkdownEditor';
import { AttachmentsList } from './AttachmentsList';
import { AttachmentUploader } from './AttachmentUploader';
import { Button } from '../Shared';
import type { ContentItem, Attachment } from '@/types';

export interface ContentPanelRootProps {
  content: ContentItem;
  isOpen: boolean;
  onClose: () => void;
  onUpdateMarkdown?: (markdown: string) => void;
  onAddAttachment?: (attachment: Attachment) => void;
  onRemoveAttachment?: (attachmentId: string) => void;
}

export const ContentPanelRoot: React.FC<ContentPanelRootProps> = ({
  content,
  isOpen,
  onClose,
  onUpdateMarkdown,
  onAddAttachment,
  onRemoveAttachment,
}) => {
  if (!isOpen) return null;

  const handleMarkdownChange = (markdown: string) => {
    if (onUpdateMarkdown) {
      onUpdateMarkdown(markdown);
    }
  };

  const handleAttachmentUpload = (attachment: Attachment) => {
    if (onAddAttachment) {
      onAddAttachment(attachment);
    }
  };

  const handleAttachmentRemove = (attachmentId: string) => {
    if (onRemoveAttachment) {
      onRemoveAttachment(attachmentId);
    }
  };

  return (
    <div className="gitboard-content-panel fixed right-0 top-0 h-full w-full md:w-1/2 lg:w-1/3 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl z-40 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="gitboard-content-panel__header flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Content Details
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close panel">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </div>

      {/* Content */}
      <div className="gitboard-content-panel__body flex-1 overflow-y-auto p-4 space-y-6">
        {/* Metadata */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div>Created: {new Date(content.createdAt).toLocaleString()}</div>
          <div>Updated: {new Date(content.updatedAt).toLocaleString()}</div>
          <div>Created by: {content.createdBy}</div>
        </div>

        {/* Markdown Editor */}
        <div className="gitboard-content-panel__markdown">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Description
          </h3>
          <MarkdownEditor value={content.body} onChange={handleMarkdownChange} />
        </div>

        {/* Attachments */}
        <div className="gitboard-content-panel__attachments">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Attachments ({content.attachments.length})
          </h3>
          <AttachmentsList
            attachments={content.attachments}
            onRemove={handleAttachmentRemove}
          />
          <div className="mt-3">
            <AttachmentUploader onUpload={handleAttachmentUpload} />
          </div>
        </div>
      </div>
    </div>
  );
};

ContentPanelRoot.displayName = 'ContentPanelRoot';
