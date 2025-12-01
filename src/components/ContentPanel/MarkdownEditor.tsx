/**
 * MarkdownEditor Component
 * Markdown editor with preview
 */

import React, { useState, useCallback } from 'react';
import { markdownToHTML } from '@/utils/markdown';

export interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your content here...',
  autoSave = true,
  autoSaveDelay = 1000,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [saveTimeoutId, setSaveTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue);

      if (autoSave && onChange) {
        // Clear existing timeout
        if (saveTimeoutId) {
          clearTimeout(saveTimeoutId);
        }

        // Set new timeout for auto-save
        const timeoutId = setTimeout(() => {
          onChange(newValue);
        }, autoSaveDelay);

        setSaveTimeoutId(timeoutId);
      } else if (onChange) {
        onChange(newValue);
      }
    },
    [autoSave, autoSaveDelay, onChange, saveTimeoutId]
  );

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e.target.value);
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'edit' ? 'preview' : 'edit'));
  };

  const previewHTML = markdownToHTML(localValue || value);

  return (
    <div className="gitboard-markdown-editor">
      {/* Toolbar */}
      <div className="gitboard-markdown-editor__toolbar flex items-center gap-2 mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={toggleMode}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            mode === 'edit'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={toggleMode}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            mode === 'preview'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Preview
        </button>
        {autoSave && (
          <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">Auto-save enabled</span>
        )}
      </div>

      {/* Editor / Preview */}
      {mode === 'edit' ? (
        <textarea
          value={localValue}
          onChange={handleTextareaChange}
          placeholder={placeholder}
          className="gitboard-markdown-editor__textarea w-full min-h-[300px] p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          spellCheck="true"
        />
      ) : (
        <div
          className="gitboard-markdown-editor__preview min-h-[300px] p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 prose dark:prose-invert max-w-none overflow-auto"
          dangerouslySetInnerHTML={{ __html: previewHTML }}
        />
      )}
    </div>
  );
};

MarkdownEditor.displayName = 'MarkdownEditor';
