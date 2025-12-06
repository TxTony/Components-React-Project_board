/**
 * FilterBar Component
 * Inline text-based filter with autocomplete
 * Syntax: field:operator:value (e.g., assigned:contains:tony, status:equals:done)
 * Supports: -field:op:val (negative), points:>3 (comparison), title:"login page" (quoted)
 */

import React, { useState, useRef, useEffect } from 'react';
import { ColumnVisibilityMenu } from './ColumnVisibilityMenu';
import type { FieldDefinition, FilterConfig } from '@/types';

export interface FilterBarProps {
  fields: FieldDefinition[];
  filters: FilterConfig[];
  onFiltersChange: (filters: FilterConfig[]) => void;
  onToggleVisibility?: (fieldId: string) => void;
}

interface Suggestion {
  type: 'field' | 'operator' | 'value';
  value: string;
  label: string;
  description?: string;
}

const OPERATORS = [
  { value: 'contains', label: 'contains', description: 'Text contains value' },
  { value: 'equals', label: 'equals', aliases: ['is', 'eq'], description: 'Exactly equals value' },
  { value: 'not-equals', label: 'not-equals', aliases: ['not', 'ne'], description: 'Does not equal value' },
  { value: 'is-empty', label: 'is-empty', aliases: ['empty'], description: 'Field is empty' },
  { value: 'is-not-empty', label: 'is-not-empty', aliases: ['not-empty'], description: 'Field is not empty' },
  { value: 'gt', label: '>', description: 'Greater than' },
  { value: 'gte', label: '>=', description: 'Greater than or equal' },
  { value: 'lt', label: '<', description: 'Less than' },
  { value: 'lte', label: '<=', description: 'Less than or equal' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  fields,
  filters,
  onFiltersChange,
  onToggleVisibility,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(0);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const isTypingRef = useRef<boolean>(false);

  // Serialize FilterConfig array into filter string
  const serializeFilters = (filterConfigs: FilterConfig[]): string => {
    return filterConfigs.map((filter) => {
      // Find the field
      const field = fields.find((f) => f.id === filter.field);
      if (!field) return '';

      const fieldName = field.name;
      const operator = filter.operator;

      // Map operator back to display format
      let displayOperator: string = operator;
      if (operator === 'gt') displayOperator = '>';
      if (operator === 'gte') displayOperator = '>=';
      if (operator === 'lt') displayOperator = '<';
      if (operator === 'lte') displayOperator = '<=';

      // Handle empty operators
      if (operator === 'is-empty' || operator === 'is-not-empty') {
        return `${fieldName}:${displayOperator}:`;
      }

      // Quote value if it contains spaces
      let value = String(filter.value || '');

      // For select fields, get the label from option ID
      if (field.options && field.type && ['single-select', 'multi-select', 'assignee', 'iteration'].includes(field.type)) {
        const option = field.options.find(opt => opt.id === filter.value);
        if (option) {
          value = option.label;
        }
      }

      const quotedValue = value.includes(' ') ? `"${value}"` : value;

      return `${fieldName}:${displayOperator}:${quotedValue}`;
    }).filter(Boolean).join(' ');
  };

  // Sync input value with filters prop when it changes externally
  useEffect(() => {
    // Don't update input if user is actively typing
    if (isTypingRef.current) {
      isTypingRef.current = false;
      return;
    }
    
    const serialized = serializeFilters(filters);
    // Only update if different to avoid infinite loops
    if (serialized !== inputValue) {
      setInputValue(serialized);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Parse filter string into FilterConfig array
  const parseFilters = (input: string): FilterConfig[] => {
    if (!input.trim()) return [];

    const filterStrings: string[] = [];
    let current = '';
    let inQuotes = false;

    // Split by spaces, but respect quotes
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      if (char === '"') {
        inQuotes = !inQuotes;
        current += char;
      } else if (char === ' ' && !inQuotes) {
        if (current.trim()) {
          filterStrings.push(current.trim());
          current = '';
        }
      } else {
        current += char;
      }
    }
    if (current.trim()) {
      filterStrings.push(current.trim());
    }

    const parsed: FilterConfig[] = [];

    for (const filterStr of filterStrings) {
      // Check for negative filter
      const isNegative = filterStr.startsWith('-');
      const cleanStr = isNegative ? filterStr.slice(1) : filterStr;

      // Parse field:operator:value
      const parts = cleanStr.split(':');
      if (parts.length < 2) continue;

      const fieldName = parts[0];
      const operatorPart = parts[1];
      const valuePart = parts.slice(2).join(':'); // In case value contains ':'

      // Find matching field
      const field = fields.find(
        (f) => f.name.toLowerCase() === fieldName.toLowerCase() ||
               f.id.toLowerCase() === fieldName.toLowerCase()
      );
      if (!field) continue;

      // Map operator
      let operator: FilterConfig['operator'] = 'contains';
      const opLower = operatorPart.toLowerCase();

      if (opLower === 'contains' || opLower === 'contain') {
        operator = 'contains';
      } else if (opLower === 'equals' || opLower === 'is' || opLower === 'eq') {
        operator = 'equals';
      } else if (opLower === 'not-equals' || opLower === 'not' || opLower === 'ne') {
        operator = 'not-equals';
      } else if (opLower === 'is-empty' || opLower === 'empty') {
        operator = 'is-empty';
      } else if (opLower === 'is-not-empty' || opLower === 'not-empty') {
        operator = 'is-not-empty';
      } else if (opLower === '>' || opLower === 'gt') {
        operator = 'gt';
      } else if (opLower === '>=' || opLower === 'gte') {
        operator = 'gte';
      } else if (opLower === '<' || opLower === 'lt') {
        operator = 'lt';
      } else if (opLower === '<=' || opLower === 'lte') {
        operator = 'lte';
      }

      // Remove quotes from value
      let value = valuePart.replace(/^"(.*)"$/, '$1');

      // Handle empty operators
      const needsValue = operator !== 'is-empty' && operator !== 'is-not-empty';

      parsed.push({
        field: field.id,
        operator: isNegative ? 'not-equals' : operator,
        value: needsValue ? value : undefined,
      });
    }

    return parsed;
  };

  // Get current token being typed (field, operator, or value)
  const getCurrentToken = (input: string, cursor: number) => {
    // Find the current filter being typed
    let start = 0;
    let inQuotes = false;

    for (let i = cursor - 1; i >= 0; i--) {
      const char = input[i];
      if (char === '"') inQuotes = !inQuotes;
      if (char === ' ' && !inQuotes) {
        start = i + 1;
        break;
      }
    }

    let end = cursor;
    inQuotes = false;
    for (let i = cursor; i < input.length; i++) {
      const char = input[i];
      if (char === '"') inQuotes = !inQuotes;
      if (char === ' ' && !inQuotes) {
        end = i;
        break;
      }
      if (i === input.length - 1) end = input.length;
    }

    const currentFilter = input.slice(start, end);
    const beforeCursor = input.slice(start, cursor);

    // Check if typing negative filter
    const isNegative = currentFilter.startsWith('-');
    const cleanFilter = isNegative ? currentFilter.slice(1) : currentFilter;
    const cleanBeforeCursor = isNegative ? beforeCursor.slice(1) : beforeCursor;

    const colonCount = (cleanBeforeCursor.match(/:/g) || []).length;

    return {
      fullToken: currentFilter,
      beforeCursor: cleanBeforeCursor,
      colonCount,
      isNegative,
      start,
      end,
    };
  };

  // Generate suggestions based on current input
  const generateSuggestions = (input: string, cursor: number): Suggestion[] => {
    const token = getCurrentToken(input, cursor);
    const suggestions: Suggestion[] = [];

    if (token.colonCount === 0) {
      // Suggesting field name
      const searchTerm = token.beforeCursor.toLowerCase();
      const visibleFields = fields.filter((f) => f.visible);

      for (const field of visibleFields) {
        if (field.name.toLowerCase().includes(searchTerm)) {
          suggestions.push({
            type: 'field',
            value: field.name,
            label: field.name,
            description: `Filter by ${field.name}`,
          });
        }
      }
    } else if (token.colonCount === 1) {
      // Suggesting operator
      const parts = token.beforeCursor.split(':');
      const fieldName = parts[0];
      const operatorSearch = parts[1]?.toLowerCase() || '';

      // Find the field
      const field = fields.find(
        (f) => f.name.toLowerCase() === fieldName.toLowerCase()
      );

      if (field) {
        for (const op of OPERATORS) {
          const matchesLabel = op.label.toLowerCase().includes(operatorSearch);
          const matchesAlias = op.aliases?.some((alias) =>
            alias.toLowerCase().includes(operatorSearch)
          );

          if (matchesLabel || matchesAlias) {
            suggestions.push({
              type: 'operator',
              value: op.label,
              label: op.label,
              description: op.description,
            });
          }
        }
      }
    } else if (token.colonCount === 2) {
      // Suggesting value
      const parts = token.beforeCursor.split(':');
      const fieldName = parts[0];
      const valueSearch = parts[2]?.toLowerCase() || '';

      const field = fields.find(
        (f) => f.name.toLowerCase() === fieldName.toLowerCase()
      );

      if (field && field.options) {
        // For select fields, suggest option values
        for (const option of field.options) {
          const labelLower = option.label.toLowerCase();
          // Match if label starts with search term
          if (labelLower.startsWith(valueSearch) ||
              // Or if any word in the label starts with search term
              labelLower.split(' ').some(word => word.startsWith(valueSearch))) {
            suggestions.push({
              type: 'value',
              value: option.label,
              label: option.label,
              description: option.description,
            });
          }
        }
      }
    }

    return suggestions;
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursor = e.target.selectionStart || 0;

    // Mark that user is actively typing
    isTypingRef.current = true;
    
    setInputValue(value);
    setCursorPosition(cursor);

    // Generate suggestions
    const newSuggestions = generateSuggestions(value, cursor);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
    setSelectedSuggestionIndex(0);

    // Parse and update filters
    const parsed = parseFilters(value);
    onFiltersChange(parsed);
  };

  // Apply suggestion
  const applySuggestion = (suggestion: Suggestion) => {
    const token = getCurrentToken(inputValue, cursorPosition);
    const before = inputValue.slice(0, token.start);
    const after = inputValue.slice(token.end);

    let newValue = '';

    if (suggestion.type === 'field') {
      newValue = `${before}${token.isNegative ? '-' : ''}${suggestion.value}:${after}`;
    } else if (suggestion.type === 'operator') {
      const parts = token.beforeCursor.split(':');
      const fieldName = parts[0];
      newValue = `${before}${token.isNegative ? '-' : ''}${fieldName}:${suggestion.value}:${after}`;
    } else if (suggestion.type === 'value') {
      const parts = token.beforeCursor.split(':');
      const fieldName = parts[0];
      const operator = parts[1];
      // Add quotes if value contains spaces
      const quotedValue = suggestion.value.includes(' ') ? `"${suggestion.value}"` : suggestion.value;
      newValue = `${before}${token.isNegative ? '-' : ''}${fieldName}:${operator}:${quotedValue}${after}`;
    }

    setInputValue(newValue);
    setShowSuggestions(false);

    // Update cursor position
    setTimeout(() => {
      if (inputRef.current) {
        const newCursor = newValue.length - after.length;
        inputRef.current.setSelectionRange(newCursor, newCursor);
        inputRef.current.focus();
      }
    }, 0);

    // Parse and update filters
    const parsed = parseFilters(newValue);
    onFiltersChange(parsed);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions[selectedSuggestionIndex]) {
        applySuggestion(suggestions[selectedSuggestionIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Track cursor position on click
  const handleClick = () => {
    const cursor = inputRef.current?.selectionStart || 0;
    setCursorPosition(cursor);

    const newSuggestions = generateSuggestions(inputValue, cursor);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
    setSelectedSuggestionIndex(0);
  };

  return (
    <div className="gitboard-filter-bar">
      <div className="gitboard-filter-bar__container">
        <div className="gitboard-filter-bar__input-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="gitboard-filter-bar__icon"
          >
            <path d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onClick={handleClick}
            placeholder="Filter (e.g., status:equals:done title:contains:login)"
            className="gitboard-filter-bar__input"
            aria-label="Filter input"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                onFiltersChange([]);
                setShowSuggestions(false);
              }}
              className="gitboard-filter-bar__clear"
              aria-label="Clear filters"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="gitboard-filter-bar__suggestions"
              role="listbox"
              aria-label="Filter suggestions"
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion.type}-${suggestion.value}-${index}`}
                  className={`gitboard-filter-bar__suggestion ${
                    index === selectedSuggestionIndex ? 'gitboard-filter-bar__suggestion--selected' : ''
                  }`}
                  onClick={() => applySuggestion(suggestion)}
                  role="option"
                  aria-selected={index === selectedSuggestionIndex}
                >
                  <div className="gitboard-filter-bar__suggestion-label">
                    <span className="gitboard-filter-bar__suggestion-type">
                      {suggestion.type}:
                    </span>
                    <span className="gitboard-filter-bar__suggestion-value">
                      {suggestion.label}
                    </span>
                  </div>
                  {suggestion.description && (
                    <div className="gitboard-filter-bar__suggestion-description">
                      {suggestion.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {onToggleVisibility && (
          <div className="gitboard-filter-bar__actions">
            <ColumnVisibilityMenu fields={fields} onToggleVisibility={onToggleVisibility} />
          </div>
        )}
      </div>
    </div>
  );
};

FilterBar.displayName = 'FilterBar';
