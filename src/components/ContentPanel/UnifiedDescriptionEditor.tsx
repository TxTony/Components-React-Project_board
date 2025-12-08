/**
 * UnifiedDescriptionEditor Component
 * Smart editor that accepts pasted documents, links, markdown, and mermaid diagrams
 * Has edit mode and render mode
 */

import React, { useState, useCallback, useEffect } from 'react';
import { MermaidViewer } from './MermaidViewer';
import { markdownToHTML } from '@/utils/markdown';
import type { Link, Document } from '@/types';

export interface UnifiedDescriptionEditorProps {
  value: string;
  onChange?: (value: string, metadata?: { links: Link[]; documents: Document[]; mermaidDiagrams: string[] }) => void;
  placeholder?: string;
}

export const UnifiedDescriptionEditor: React.FC<UnifiedDescriptionEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your description using Markdown...\n\nPaste links, upload documents, or add Mermaid diagrams using ```mermaid code blocks.\n\nYou can also paste images (Ctrl+V) directly from your clipboard!',
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [mode, setMode] = useState<'edit' | 'render'>('render');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Parse content to extract links, documents, and mermaid diagrams
  const parseContent = useCallback((text: string) => {
    const links: Link[] = [];
    const documents: Document[] = [];
    const mermaidDiagrams: string[] = [];

    // Extract Mermaid diagrams (```mermaid ... ```)
    const mermaidRegex = /```mermaid\s*\n([\s\S]*?)```/g;
    let mermaidMatch: RegExpExecArray | null;
    while ((mermaidMatch = mermaidRegex.exec(text)) !== null) {
      if (mermaidMatch[1]) {
        mermaidDiagrams.push(mermaidMatch[1].trim());
      }
    }

    // Extract markdown links [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let linkMatch: RegExpExecArray | null;
    while ((linkMatch = linkRegex.exec(text)) !== null) {
      if (linkMatch[1] && linkMatch[2]) {
        links.push({
          id: `link-${links.length}`,
          title: linkMatch[1],
          url: linkMatch[2],
        });
      }
    }

    // Extract plain URLs
    const urlRegex = /https?:\/\/[^\s<>"]+/g;
    let urlMatch: RegExpExecArray | null;
    while ((urlMatch = urlRegex.exec(text)) !== null) {
      // Skip if already captured in markdown link
      const alreadyCaptured = links.some(link => link.url === urlMatch![0]);
      if (!alreadyCaptured && urlMatch[0]) {
        links.push({
          id: `link-${links.length}`,
          title: urlMatch[0],
          url: urlMatch[0],
        });
      }
    }

    return { links, documents, mermaidDiagrams };
  }, []);

  const handleChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue);

      if (onChange) {
        const metadata = parseContent(newValue);
        onChange(newValue, metadata);
      }
    },
    [onChange, parseContent]
  );

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e.target.value);
  };

  // Handle paste events for images
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      // Check if clipboard contains an image
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item) continue;
        
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault(); // Prevent default paste behavior
          
          const file = item.getAsFile();
          if (!file) continue;

          setIsUploadingImage(true);

          try {
            // Convert image to base64
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64Image = event.target?.result as string;
              const timestamp = Date.now();
              const imageName = `pasted-image-${timestamp}.png`;
              
              // Insert markdown image syntax at cursor position
              const textarea = textareaRef.current;
              if (textarea) {
                const cursorPos = textarea.selectionStart;
                const textBefore = localValue.substring(0, cursorPos);
                const textAfter = localValue.substring(cursorPos);
                
                // Add image in markdown format with base64 data
                const imageMarkdown = `\n![${imageName}](${base64Image})\n`;
                const newValue = textBefore + imageMarkdown + textAfter;
                
                handleChange(newValue);
                
                // Set cursor position after inserted image
                setTimeout(() => {
                  const newCursorPos = cursorPos + imageMarkdown.length;
                  textarea.setSelectionRange(newCursorPos, newCursorPos);
                  textarea.focus();
                }, 0);
              }
              
              setIsUploadingImage(false);
            };

            reader.onerror = () => {
              console.error('Error reading image file');
              setIsUploadingImage(false);
            };

            reader.readAsDataURL(file);
          } catch (error) {
            console.error('Error processing pasted image:', error);
            setIsUploadingImage(false);
          }
          
          break; // Only handle first image
        }
      }
    },
    [localValue, handleChange]
  );

  // Handle drag and drop for images
  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      
      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      // Process only image files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;
        
        if (file.type.indexOf('image') !== -1) {
          setIsUploadingImage(true);

          try {
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64Image = event.target?.result as string;
              const imageName = file.name;
              
              // Append image at the end
              const imageMarkdown = `\n![${imageName}](${base64Image})\n`;
              const newValue = localValue + imageMarkdown;
              
              handleChange(newValue);
              setIsUploadingImage(false);
            };

            reader.onerror = () => {
              console.error('Error reading image file');
              setIsUploadingImage(false);
            };

            reader.readAsDataURL(file);
          } catch (error) {
            console.error('Error processing dropped image:', error);
            setIsUploadingImage(false);
          }
        }
      }
    },
    [localValue, handleChange]
  );

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  // Parse current content
  const { links, documents, mermaidDiagrams } = parseContent(localValue);

  // Remove mermaid blocks from markdown for rendering
  const markdownWithoutMermaid = localValue.replace(/```mermaid\s*\n[\s\S]*?```/g, '');
  const renderedHTML = markdownToHTML(markdownWithoutMermaid);

  return (
    <div className="gitboard-unified-description-editor">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === 'edit'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            ✏️ Edit
          </button>
          <button
            type="button"
            onClick={() => setMode('render')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === 'render'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            👁️ Preview
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          {mermaidDiagrams.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              {mermaidDiagrams.length} diagram{mermaidDiagrams.length !== 1 ? 's' : ''}
            </span>
          )}
          {links.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {links.length} link{links.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Editor / Render Mode */}
      {mode === 'edit' ? (
        <div>
          <textarea
            ref={textareaRef}
            value={localValue}
            onChange={handleTextareaChange}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            placeholder={placeholder}
            className="w-full min-h-[500px] p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500"
            spellCheck="true"
            disabled={isUploadingImage}
          />
          
          {/* Upload indicator */}
          {isUploadingImage && (
            <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing image...</span>
            </div>
          )}
          
          {/* Help text */}
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-300 font-medium mb-2">
              💡 Tips:
            </p>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 ml-4 list-disc">
              <li>Use Markdown syntax for formatting (headers, lists, bold, italic, etc.)</li>
              <li>Paste or type URLs - they'll be automatically detected</li>
              <li>Add Mermaid diagrams using <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">```mermaid ... ```</code></li>
              <li>Create links with <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">[text](url)</code></li>
              <li><strong>Paste images</strong> directly from clipboard (Ctrl+V / Cmd+V) or drag & drop</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Rendered Markdown */}
          {markdownWithoutMermaid.trim() && (
            <div className="prose dark:prose-invert max-w-none">
              <div
                className="rendered-markdown text-gray-900 dark:text-gray-100"
                dangerouslySetInnerHTML={{ __html: renderedHTML }}
              />
            </div>
          )}

          {/* Links Section */}
          {links.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Links ({links.length})
              </h4>
              <div className="space-y-2">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                  >
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {link.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {link.url}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Mermaid Diagrams Section */}
          {mermaidDiagrams.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Diagrams ({mermaidDiagrams.length})
              </h4>
              <MermaidViewer diagrams={mermaidDiagrams} />
            </div>
          )}

          {/* Documents Section (placeholder for future) */}
          {documents.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documents ({documents.length})
              </h4>
              {/* Documents viewer will be implemented later */}
            </div>
          )}

          {/* Empty state */}
          {!markdownWithoutMermaid.trim() && links.length === 0 && mermaidDiagrams.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                No content yet. Click "Edit" to add a description.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

UnifiedDescriptionEditor.displayName = 'UnifiedDescriptionEditor';
