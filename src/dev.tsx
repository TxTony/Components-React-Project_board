/**
 * Development Demo App
 * Showcases GitBoardTable component during development
 */

import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GitBoardTable } from './components/GitBoardTable';
import { fields, rows, users, iterations } from './mocks/mockData';
import type { Row, Theme } from './types';
import './styles/styles.css';

function DevApp() {
  const [theme, setTheme] = useState<Theme>('light');
  const [tableRows, setTableRows] = useState<Row[]>(rows);

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleRowChange = (updatedRows: Row[]) => {
    console.log('Rows changed:', updatedRows);
    setTableRows(updatedRows);
  };

  const handleRowOpen = (row: Row) => {
    console.log('Row opened:', row);
  };

  return (
    <div className={theme} style={{ minHeight: '100vh' }}>
      <div
        style={{
          padding: '2rem',
          backgroundColor: theme === 'light' ? '#ffffff' : '#0d1117',
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                color: theme === 'light' ? '#1f2328' : '#e6edf3',
              }}
            >
              GitBoard Table - Development Demo
            </h1>
            <p
              style={{
                color: theme === 'light' ? '#656d76' : '#8d96a0',
              }}
            >
              A GitHub Projects-style editable table component
            </p>
          </div>
          <button
            onClick={handleThemeToggle}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: '1px solid',
              borderColor: theme === 'light' ? '#d0d7de' : '#30363d',
              backgroundColor: theme === 'light' ? '#f6f8fa' : '#161b22',
              color: theme === 'light' ? '#1f2328' : '#e6edf3',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>

        {/* Stats */}
        <div
          style={{
            marginBottom: '2rem',
            padding: '1rem',
            borderRadius: '0.375rem',
            backgroundColor: theme === 'light' ? '#f6f8fa' : '#161b22',
            border: '1px solid',
            borderColor: theme === 'light' ? '#d0d7de' : '#30363d',
          }}
        >
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div>
              <strong style={{ color: theme === 'light' ? '#1f2328' : '#e6edf3' }}>
                Fields:
              </strong>{' '}
              <span style={{ color: theme === 'light' ? '#656d76' : '#8d96a0' }}>
                {fields.length}
              </span>
            </div>
            <div>
              <strong style={{ color: theme === 'light' ? '#1f2328' : '#e6edf3' }}>
                Rows:
              </strong>{' '}
              <span style={{ color: theme === 'light' ? '#656d76' : '#8d96a0' }}>
                {tableRows.length}
              </span>
            </div>
            <div>
              <strong style={{ color: theme === 'light' ? '#1f2328' : '#e6edf3' }}>
                Users:
              </strong>{' '}
              <span style={{ color: theme === 'light' ? '#656d76' : '#8d96a0' }}>
                {users.length}
              </span>
            </div>
            <div>
              <strong style={{ color: theme === 'light' ? '#1f2328' : '#e6edf3' }}>
                Iterations:
              </strong>{' '}
              <span style={{ color: theme === 'light' ? '#656d76' : '#8d96a0' }}>
                {iterations.length}
              </span>
            </div>
          </div>
        </div>

        {/* Component */}
        <div
          style={{
            border: '1px solid',
            borderColor: theme === 'light' ? '#d0d7de' : '#30363d',
            borderRadius: '0.375rem',
            overflow: 'hidden',
          }}
        >
          <GitBoardTable
            fields={fields}
            rows={tableRows}
            theme={theme}
            onChange={handleRowChange}
            onRowOpen={handleRowOpen}
            users={users}
            iterations={iterations}
          />
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            textAlign: 'center',
            color: theme === 'light' ? '#8c959f' : '#6e7681',
            fontSize: '0.875rem',
          }}
        >
          <p>
            Built with React + TypeScript + TailwindCSS | TDD Approach with Vitest
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            Open console to see event logs (onChange, onRowOpen)
          </p>
        </div>
      </div>
    </div>
  );
}

// Mount the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <DevApp />
    </React.StrictMode>
  );
}
