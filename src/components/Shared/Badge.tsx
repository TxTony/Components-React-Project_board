/**
 * Badge Component
 * Colored badge for tags, statuses, and labels
 */

import React from 'react';

export interface BadgeProps {
  label: string;
  color?: string;
  variant?: 'solid' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  onRemove?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color,
  variant = 'solid',
  size = 'md',
  onRemove,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const variantClasses = variant === 'solid'
    ? 'text-white'
    : 'bg-transparent border';

  const backgroundColor = color || '#6b7280';
  const borderColor = color || '#6b7280';

  const style: React.CSSProperties = variant === 'solid'
    ? { backgroundColor }
    : { borderColor, color: borderColor };

  return (
    <span
      className={`gitboard-badge inline-flex items-center gap-1 rounded-md font-medium ${sizeClasses[size]} ${variantClasses}`}
      style={style}
    >
      <span className="gitboard-badge__label">{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="gitboard-badge__remove hover:opacity-70"
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      )}
    </span>
  );
};

Badge.displayName = 'Badge';
