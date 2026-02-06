/**
 * ColumnValuesList Component
 * Displays and allows editing of all column values for a row
 * Shows in the detail panel to provide quick access to all fields
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Row, FieldDefinition, FieldOption, CellValue } from '@/types';

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export interface ColumnValuesListProps {
  row: Row;
  fields: FieldDefinition[];
  onValueChange?: (fieldId: string, value: CellValue) => void;
}

export const ColumnValuesList: React.FC<ColumnValuesListProps> = ({
  row,
  fields,
  onValueChange,
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const visibleFields = fields.filter(f => f.visible);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openDropdown && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const filterOptions = useCallback((options: FieldOption[] | undefined, query: string) => {
    if (!options) return [];
    if (!query) return options;
    const lower = query.toLowerCase();
    return options.filter(o => o.label.toLowerCase().includes(lower));
  }, []);

  const handleStartEdit = useCallback((field: FieldDefinition) => {
    const currentValue = row.values[field.id];
    setEditingField(field.id);
    setEditValue(currentValue?.toString() || '');
  }, [row.values]);

  const handleSaveEdit = useCallback((fieldId: string) => {
    if (onValueChange) {
      const field = fields.find(f => f.id === fieldId);
      let finalValue: CellValue = editValue;

      // Convert value based on field type
      if (field?.type === 'number') {
        finalValue = editValue ? parseFloat(editValue) : null;
      } else if (field?.type === 'date') {
        finalValue = editValue || null;
      } else if (field?.type === 'link') {
        const trimmed = editValue.trim();
        if (trimmed && !trimmed.match(/^https?:\/\//i)) {
          finalValue = `https://${trimmed}`;
        } else {
          finalValue = trimmed || null;
        }
      }

      onValueChange(fieldId, finalValue);
    }
    setEditingField(null);
    setEditValue('');
  }, [editValue, fields, onValueChange]);

  const handleCancelEdit = useCallback(() => {
    setEditingField(null);
    setEditValue('');
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, fieldId: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(fieldId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  }, [handleSaveEdit, handleCancelEdit]);

  const handleSelectChange = useCallback((fieldId: string, value: string) => {
    if (onValueChange) {
      onValueChange(fieldId, value);
    }
  }, [onValueChange]);

  const renderFieldValue = (field: FieldDefinition) => {
    const value = row.values[field.id];
    const isEditing = editingField === field.id;

    // Text and number fields
    if (field.type === 'text' || field.type === 'number' || field.type === 'title') {
      if (isEditing) {
        return (
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleSaveEdit(field.id)}
            onKeyDown={(e) => handleKeyDown(e, field.id)}
            className="gitboard-column-value__input flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        );
      }
      return (
        <div
          onClick={() => handleStartEdit(field)}
          className="gitboard-column-value__display flex-1 px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {value || <span className="text-gray-400 italic">Empty</span>}
        </div>
      );
    }

    // Date field
    if (field.type === 'date') {
      if (isEditing) {
        return (
          <input
            type="date"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleSaveEdit(field.id)}
            onKeyDown={(e) => handleKeyDown(e, field.id)}
            className="gitboard-column-value__input flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        );
      }
      return (
        <div
          onClick={() => handleStartEdit(field)}
          className="gitboard-column-value__display flex-1 px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {value ? new Date(value as string).toLocaleDateString() : <span className="text-gray-400 italic">No date</span>}
        </div>
      );
    }

    // Single-select field
    if (field.type === 'single-select') {
      const isOpen = openDropdown === field.id;
      const selectedOption = field.options?.find((o: FieldOption) => o.id === value);
      const filtered = filterOptions(field.options, isOpen ? searchQuery : '');

      return (
        <div className="flex-1 relative" ref={isOpen ? dropdownRef : undefined}>
          <div
            onClick={() => {
              setOpenDropdown(isOpen ? null : field.id);
              setSearchQuery('');
            }}
            className="gitboard-column-value__display flex items-center justify-between px-2 py-1 text-sm cursor-pointer border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:border-blue-500"
          >
            {selectedOption ? (
              <span
                className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md"
                style={selectedOption.color ? {
                  backgroundColor: hexToRgba(selectedOption.color, 0.1),
                  borderWidth: '1.5px', borderStyle: 'solid',
                  borderColor: selectedOption.color, color: selectedOption.color,
                } : undefined}
              >
                {selectedOption.label}
              </span>
            ) : (
              <span className="text-gray-400">Select...</span>
            )}
            <svg className="w-3 h-3 text-gray-400 flex-shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {isOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
              <div className="p-1.5">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') { setOpenDropdown(null); setSearchQuery(''); }
                  }}
                />
              </div>
              <div className="max-h-[180px] overflow-y-auto">
                <div
                  className="px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                  onClick={() => { handleSelectChange(field.id, ''); setOpenDropdown(null); setSearchQuery(''); }}
                >
                  Clear selection
                </div>
                {filtered.map((option: FieldOption) => (
                  <div
                    key={option.id}
                    className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${value === option.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    onClick={() => { handleSelectChange(field.id, option.id); setOpenDropdown(null); setSearchQuery(''); }}
                  >
                    <span
                      className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md"
                      style={option.color ? {
                        backgroundColor: hexToRgba(option.color, 0.1),
                        borderWidth: '1.5px', borderStyle: 'solid',
                        borderColor: option.color, color: option.color,
                      } : undefined}
                    >
                      {option.label}
                    </span>
                    {value === option.id && (
                      <svg className="w-3.5 h-3.5 text-blue-600 ml-auto flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="px-3 py-2 text-xs text-gray-400 italic">No matches</div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Multi-select field
    if (field.type === 'multi-select') {
      const selectedValues = Array.isArray(value) ? value : [];
      const isOpen = openDropdown === field.id;
      const filtered = filterOptions(field.options, isOpen ? searchQuery : '');

      return (
        <div className="flex-1 relative" ref={isOpen ? dropdownRef : undefined}>
          <div
            onClick={() => {
              setOpenDropdown(isOpen ? null : field.id);
              setSearchQuery('');
            }}
            className="gitboard-column-value__display flex items-center justify-between px-2 py-1 text-sm cursor-pointer border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:border-blue-500 min-h-[30px]"
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {selectedValues.length > 0 ? (
                selectedValues.map((v: string) => {
                  const opt = field.options?.find((o: FieldOption) => o.id === v);
                  if (!opt) return null;
                  return (
                    <span
                      key={opt.id}
                      className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md"
                      style={opt.color ? {
                        backgroundColor: hexToRgba(opt.color, 0.1),
                        borderWidth: '1.5px', borderStyle: 'solid',
                        borderColor: opt.color, color: opt.color,
                      } : undefined}
                    >
                      {opt.label}
                    </span>
                  );
                })
              ) : (
                <span className="text-gray-400">None selected</span>
              )}
            </div>
            <svg className="w-3 h-3 text-gray-400 flex-shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {isOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
              <div className="p-1.5">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') { setOpenDropdown(null); setSearchQuery(''); }
                  }}
                />
              </div>
              <div className="max-h-[180px] overflow-y-auto">
                {selectedValues.length > 0 && (
                  <div
                    className="px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                    onClick={() => {
                      if (onValueChange) onValueChange(field.id, null);
                    }}
                  >
                    Clear all
                  </div>
                )}
                {filtered.map((option: FieldOption) => {
                  const isSelected = selectedValues.includes(option.id);
                  return (
                    <label
                      key={option.id}
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          const newValues = isSelected
                            ? selectedValues.filter((id: string) => id !== option.id)
                            : [...selectedValues, option.id];
                          if (onValueChange) {
                            onValueChange(field.id, newValues.length > 0 ? newValues : null);
                          }
                        }}
                        className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"
                      />
                      <span
                        className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md"
                        style={option.color ? {
                          backgroundColor: hexToRgba(option.color, 0.1),
                          borderWidth: '1.5px', borderStyle: 'solid',
                          borderColor: option.color, color: option.color,
                        } : undefined}
                      >
                        {option.label}
                      </span>
                    </label>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="px-3 py-2 text-xs text-gray-400 italic">No matches</div>
                )}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-500">
                {selectedValues.length} selected
              </div>
            </div>
          )}
        </div>
      );
    }

    // Assignee field
    if (field.type === 'assignee') {
      if (field.options && field.options.length > 0) {
        const isOpen = openDropdown === field.id;
        const selectedOption = field.options.find((o: FieldOption) => o.id === value);
        const filtered = filterOptions(field.options, isOpen ? searchQuery : '');

        return (
          <div className="flex-1 relative" ref={isOpen ? dropdownRef : undefined}>
            <div
              onClick={() => {
                setOpenDropdown(isOpen ? null : field.id);
                setSearchQuery('');
              }}
              className="gitboard-column-value__display flex items-center justify-between px-2 py-1 text-sm cursor-pointer border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:border-blue-500"
            >
              <span className={selectedOption ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}>
                {selectedOption?.label || 'Unassigned'}
              </span>
              <svg className="w-3 h-3 text-gray-400 flex-shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {isOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                <div className="p-1.5">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') { setOpenDropdown(null); setSearchQuery(''); }
                    }}
                  />
                </div>
                <div className="max-h-[180px] overflow-y-auto">
                  <div
                    className="px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                    onClick={() => { handleSelectChange(field.id, ''); setOpenDropdown(null); setSearchQuery(''); }}
                  >
                    Clear selection
                  </div>
                  {filtered.map((option: FieldOption) => (
                    <div
                      key={option.id}
                      className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${value === option.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      onClick={() => { handleSelectChange(field.id, option.id); setOpenDropdown(null); setSearchQuery(''); }}
                    >
                      <span className="text-gray-900 dark:text-gray-100">{option.label}</span>
                      {value === option.id && (
                        <svg className="w-3.5 h-3.5 text-blue-600 ml-auto flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <div className="px-3 py-2 text-xs text-gray-400 italic">No matches</div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }
      // Fallback to text input when no options defined
      if (isEditing) {
        return (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleSaveEdit(field.id)}
            onKeyDown={(e) => handleKeyDown(e, field.id)}
            className="gitboard-column-value__input flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter assignee..."
            autoFocus
          />
        );
      }
      return (
        <div
          onClick={() => handleStartEdit(field)}
          className="gitboard-column-value__display flex-1 px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {value || <span className="text-gray-400 italic">Unassigned</span>}
        </div>
      );
    }

    // Iteration field
    if (field.type === 'iteration') {
      if (field.options && field.options.length > 0) {
        const isOpen = openDropdown === field.id;
        const selectedOption = field.options.find((o: FieldOption) => o.id === value);
        const filtered = filterOptions(field.options, isOpen ? searchQuery : '');

        return (
          <div className="flex-1 relative" ref={isOpen ? dropdownRef : undefined}>
            <div
              onClick={() => {
                setOpenDropdown(isOpen ? null : field.id);
                setSearchQuery('');
              }}
              className="gitboard-column-value__display flex items-center justify-between px-2 py-1 text-sm cursor-pointer border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:border-blue-500"
            >
              <span className={selectedOption ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}>
                {selectedOption?.label || 'No iteration'}
              </span>
              <svg className="w-3 h-3 text-gray-400 flex-shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {isOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                <div className="p-1.5">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') { setOpenDropdown(null); setSearchQuery(''); }
                    }}
                  />
                </div>
                <div className="max-h-[180px] overflow-y-auto">
                  <div
                    className="px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                    onClick={() => { handleSelectChange(field.id, ''); setOpenDropdown(null); setSearchQuery(''); }}
                  >
                    Clear selection
                  </div>
                  {filtered.map((option: FieldOption) => (
                    <div
                      key={option.id}
                      className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${value === option.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      onClick={() => { handleSelectChange(field.id, option.id); setOpenDropdown(null); setSearchQuery(''); }}
                    >
                      <span className="text-gray-900 dark:text-gray-100">{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
                      )}
                      {value === option.id && (
                        <svg className="w-3.5 h-3.5 text-blue-600 ml-auto flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <div className="px-3 py-2 text-xs text-gray-400 italic">No matches</div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }
      // Fallback to text input when no options defined
      if (isEditing) {
        return (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleSaveEdit(field.id)}
            onKeyDown={(e) => handleKeyDown(e, field.id)}
            className="gitboard-column-value__input flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter iteration..."
            autoFocus
          />
        );
      }
      return (
        <div
          onClick={() => handleStartEdit(field)}
          className="gitboard-column-value__display flex-1 px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {value || <span className="text-gray-400 italic">No iteration</span>}
        </div>
      );
    }

    // Link field
    if (field.type === 'link') {
      if (isEditing) {
        return (
          <input
            type="url"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleSaveEdit(field.id)}
            onKeyDown={(e) => handleKeyDown(e, field.id)}
            className="gitboard-column-value__input flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com"
            autoFocus
          />
        );
      }
      return (
        <div
          onClick={() => handleStartEdit(field)}
          className="gitboard-column-value__display flex-1 px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {value ? (
            <a
              href={value.toString()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {value.toString()}
            </a>
          ) : (
            <span className="text-gray-400 italic">No link</span>
          )}
        </div>
      );
    }

    return (
      <div className="gitboard-column-value__display flex-1 px-2 py-1 text-sm text-gray-500">
        {value?.toString() || '—'}
      </div>
    );
  };

  return (
    <div className="gitboard-column-values-list space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Column Values
      </h3>
      <div className="space-y-1">
        {visibleFields.map((field) => (
          <div
            key={field.id}
            className="gitboard-column-value-item flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800"
          >
            <div className="gitboard-column-value__label w-32 flex-shrink-0 text-sm font-medium text-gray-600 dark:text-gray-400">
              {field.name}
            </div>
            <div className="gitboard-column-value__value flex-1 flex items-center">
              {renderFieldValue(field)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
