/**
 * LinksViewer Component
 * Displays and manages external links for row content
 */

import React, { useState } from 'react';
import { Button } from '../Shared';
import type { Link } from '@/types';
import { generateRowId } from '@/utils/uid';

export interface LinksViewerProps {
  links: Link[];
  onChange: (links: Link[]) => void;
}

interface LinkFormData {
  url: string;
  title: string;
  description: string;
}

export const LinksViewer: React.FC<LinksViewerProps> = ({ links, onChange }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<LinkFormData>({
    url: '',
    title: '',
    description: '',
  });
  const [error, setError] = useState<string>('');

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({ url: '', title: '', description: '' });
    setError('');
  };

  const handleCancel = () => {
    setIsAdding(false);
    setFormData({ url: '', title: '', description: '' });
    setError('');
  };

  const handleSave = () => {
    // Validate URL
    if (!formData.url) {
      setError('URL is required');
      return;
    }

    if (!validateUrl(formData.url)) {
      setError('Invalid URL format');
      return;
    }

    if (!formData.title) {
      setError('Title is required');
      return;
    }

    // Create new link
    const newLink: Link = {
      id: generateRowId(),
      url: formData.url,
      title: formData.title,
      description: formData.description,
    };

    // Add to links array
    onChange([...links, newLink]);

    // Reset form
    setIsAdding(false);
    setFormData({ url: '', title: '', description: '' });
    setError('');
  };

  const handleDelete = (linkId: string) => {
    onChange(links.filter((link) => link.id !== linkId));
  };

  if (links.length === 0 && !isAdding) {
    return (
      <div className="space-y-4">
        <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
          No links added yet
        </div>
        <Button onClick={handleAdd} variant="primary" size="sm">
          Add Link
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          External Links
        </h3>
        {!isAdding && (
          <Button onClick={handleAdd} variant="primary" size="sm">
            Add Link
          </Button>
        )}
      </div>

      {/* Links List */}
      <div className="space-y-3">
        {links.map((link) => (
          <div
            key={link.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm block truncate"
                >
                  {link.title}
                </a>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                  {link.url}
                </p>
                {link.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    {link.description}
                  </p>
                )}
              </div>
              <Button
                onClick={() => handleDelete(link.id)}
                variant="ghost"
                size="sm"
                aria-label="Delete link"
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

      {/* Add Link Form */}
      {isAdding && (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Add New Link
          </h4>

          {error && (
            <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="Enter URL (e.g., https://example.com)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter title"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} variant="primary" size="sm">
                Save
              </Button>
              <Button onClick={handleCancel} variant="ghost" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

LinksViewer.displayName = 'LinksViewer';
