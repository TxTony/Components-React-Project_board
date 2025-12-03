/**
 * ViewTabs Component
 * Displays tabs for switching between saved views (filters + sorting + columns)
 */

import React from 'react';
import type { ViewConfig } from '@/types';

export interface ViewTabsProps {
  views: ViewConfig[];
  currentViewId: string;
  onViewChange: (view: ViewConfig) => void;
}

export const ViewTabs: React.FC<ViewTabsProps> = ({
  views,
  currentViewId,
  onViewChange,
}) => {
  return (
    <div className="gitboard-view-tabs" role="tablist">
      {views.map((view) => {
        const isActive = view.id === currentViewId;

        return (
          <button
            key={view.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`view-${view.id}`}
            className={`gitboard-view-tabs__tab ${
              isActive ? 'gitboard-view-tabs__tab--active' : ''
            }`}
            onClick={() => onViewChange(view)}
          >
            {view.name}
            {view.filters.length > 0 && (
              <span className="gitboard-view-tabs__badge">
                {view.filters.length}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

ViewTabs.displayName = 'ViewTabs';
