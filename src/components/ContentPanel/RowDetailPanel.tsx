/**
 * RowDetailPanel Component
 * Side panel for viewing and editing row content
 * Opens when user clicks on title column or double-clicks row number
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../Shared';
import { UnifiedDescriptionEditor } from './UnifiedDescriptionEditor';
import type { Row, RowContent, Link, Document } from '@/types';

export interface RowDetailPanelProps {
  row: Row;
  isOpen: boolean;
  onClose: () => void;
  onContentUpdate?: (rowId: string, content: RowContent) => void;
}

export const RowDetailPanel: React.FC<RowDetailPanelProps> = ({
  row,
  isOpen,
  onClose,
  onContentUpdate,
}) => {
  const [content, setContent] = useState<RowContent>(() => ({
    description: row.content?.description || '',
    mermaidDiagrams: row.content?.mermaidDiagrams || [],
    links: row.content?.links || [],
    documents: row.content?.documents || [],
    attachments: row.content?.attachments || [],
  }));

  // Update content when row changes
  useEffect(() => {
    setContent({
      description: row.content?.description || '',
      mermaidDiagrams: row.content?.mermaidDiagrams || [],
      links: row.content?.links || [],
      documents: row.content?.documents || [],
      attachments: row.content?.attachments || [],
    });
  }, [row]);

  // Handle ESC key to close panel
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when panel is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleDescriptionChange = useCallback(
    (value: string, metadata?: { links: Link[]; documents: Document[]; mermaidDiagrams: string[] }) => {
      const updatedContent: RowContent = {
        ...content,
        description: value,
        links: metadata?.links || [],
        documents: metadata?.documents || [],
        mermaidDiagrams: metadata?.mermaidDiagrams || [],
      };
      setContent(updatedContent);

      if (onContentUpdate) {
        onContentUpdate(row.id, updatedContent);
      }
    },
    [content, row.id, onContentUpdate]
  );

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the overlay itself, not the panel content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Get title from row values
  const title = Object.values(row.values)[0] as string || 'Untitled';

  return (
    <div
      className="gitboard-row-detail-panel-overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end"
      onClick={handleOverlayClick}
      data-testid="panel-overlay"
    >
      <div
        className="gitboard-row-detail-panel h-full w-full md:w-2/3 lg:w-1/2 xl:w-2/5 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col animate-slide-in"
        role="complementary"
        aria-label="Row details panel"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="gitboard-row-detail-panel__header flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              ID: {row.id}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close panel"
            className="ml-4"
          >
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
        <div className="gitboard-row-detail-panel__content flex-1 overflow-y-auto p-6">
          <UnifiedDescriptionEditor
            value={content.description}
            onChange={handleDescriptionChange}
          />
        </div>
      </div>
    </div>
  );
};

RowDetailPanel.displayName = 'RowDetailPanel';
