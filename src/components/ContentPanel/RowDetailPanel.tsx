/**
 * RowDetailPanel Component
 * Side panel for viewing and editing row content
 * Opens when user clicks on title column or double-clicks row number
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../Shared';
import { UnifiedDescriptionEditor } from './UnifiedDescriptionEditor';
import { ColumnValuesList } from './ColumnValuesList';
import type { Row, RowContent, Link, Document, FieldDefinition, CellValue, CustomAction } from '@/types';

export interface RowDetailPanelProps {
  row: Row;
  fields: FieldDefinition[];
  isOpen: boolean;
  onClose: () => void;
  onContentUpdate?: (rowId: string, content: RowContent) => void;
  onRowUpdate?: (rowId: string, fieldId: string, value: CellValue) => void;
  onDelete?: (rowId: string) => void;
  onDuplicate?: (rowId: string) => void;
  customActions?: CustomAction[];
  onCustomAction?: (actionName: string, row: Row) => void;
}

export const RowDetailPanel: React.FC<RowDetailPanelProps> = ({
  row,
  fields,
  isOpen,
  onClose,
  onContentUpdate,
  onRowUpdate,
  onDelete,
  onDuplicate,
  customActions = [],
  onCustomAction,
}) => {
  const [content, setContent] = useState<RowContent>(() => ({
    description: row.content?.description || '',
    mermaidDiagrams: row.content?.mermaidDiagrams || [],
    links: row.content?.links || [],
    documents: row.content?.documents || [],
    attachments: row.content?.attachments || [],
  }));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);

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

  // Handle ESC key to close panel or cancel delete confirmation
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          onClose();
        }
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
  }, [isOpen, onClose, showDeleteConfirm]);

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

  const handleColumnValueChange = useCallback(
    (fieldId: string, value: CellValue) => {
      if (onRowUpdate) {
        onRowUpdate(row.id, fieldId, value);
      }
    },
    [row.id, onRowUpdate]
  );

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(row.id);
      onClose();
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(row.id);
    }
  };

  const handleCustomAction = (actionName: string) => {
    if (onCustomAction) {
      onCustomAction(actionName, row);
    }
  };

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
        className="gitboard-row-detail-panel h-full w-full md:w-[90%] bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col animate-slide-in"
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

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            {/* Duplicate action */}
            {onDuplicate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDuplicate}
                aria-label="Duplicate row"
                title="Duplicate row"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </Button>
            )}

            {/* Custom actions */}
            {customActions.map((action) => (
              <Button
                key={action.name}
                variant="ghost"
                size="sm"
                onClick={() => handleCustomAction(action.name)}
                aria-label={action.label}
                title={action.label}
              >
                {action.icon ? (
                  <span className="w-4 h-4 flex items-center justify-center">{action.icon}</span>
                ) : (
                  <span className="text-sm">{action.label}</span>
                )}
              </Button>
            ))}

            {/* Delete action */}
            {onDelete && !showDeleteConfirm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                aria-label="Delete row"
                title="Delete row"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            )}

            {/* Delete confirmation */}
            {showDeleteConfirm && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">
                <span className="text-sm text-red-900 dark:text-red-200 font-medium">Delete?</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteConfirm}
                  aria-label="Confirm delete"
                  className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteCancel}
                  aria-label="Cancel delete"
                  className="text-gray-600 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            )}
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
        <div className="gitboard-row-detail-panel__content flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-6">
          {/* Left Column - Description Editor */}
          <div className="gitboard-row-detail-panel__left pr-6 border-r border-gray-200 dark:border-gray-700">
            <UnifiedDescriptionEditor
              value={content.description}
              onChange={handleDescriptionChange}
            />
          </div>

          {/* Right Column - Column Values */}
          <div className="gitboard-row-detail-panel__right pl-6">
            <ColumnValuesList
              row={row}
              fields={fields}
              onValueChange={handleColumnValueChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

RowDetailPanel.displayName = 'RowDetailPanel';
