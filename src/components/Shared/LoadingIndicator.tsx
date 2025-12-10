/**
 * LoadingIndicator Component
 * Shows loading state for infinite scroll or async operations
 */

import React from 'react';

export interface LoadingIndicatorProps {
  /**
   * Size of the spinner
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Optional message to display
   */
  message?: string;

  /**
   * Whether to show as inline (vs. centered block)
   * @default false
   */
  inline?: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'medium',
  message,
  inline = false,
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  return (
    <div
      className={`gitboard-table__loading-indicator ${inline ? 'gitboard-table__loading-indicator--inline' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <svg
        className={`gitboard-table__spinner ${sizeClasses[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="gitboard-table__spinner-track"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="gitboard-table__spinner-path"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {message && (
        <span className="gitboard-table__loading-message">{message}</span>
      )}
      <span className="sr-only">Loading more items...</span>
    </div>
  );
};

LoadingIndicator.displayName = 'LoadingIndicator';
