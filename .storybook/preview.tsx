import type { Preview } from '@storybook/react';
import React from 'react';
import '../src/styles/styles.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#0d1117',
        },
      ],
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light';

      // Set the background color based on theme
      if (theme === 'dark') {
        document.body.style.backgroundColor = '#0d1117';
      } else {
        document.body.style.backgroundColor = '#ffffff';
      }

      return (
        <div className={theme} style={{ minHeight: '100vh' }}>
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
