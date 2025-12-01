/**
 * Theme Tokens
 * GitHub Primer-inspired design tokens for colors and styling
 */

export interface ThemeTokens {
  // Background colors
  bgDefault: string;
  bgSubtle: string;
  bgMuted: string;
  bgOverlay: string;
  bgInset: string;

  // Border colors
  borderDefault: string;
  borderMuted: string;
  borderSubtle: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textLink: string;
  textDanger: string;
  textSuccess: string;
  textWarning: string;

  // Component colors
  canvasDefault: string;
  canvasSubtle: string;
  accentFg: string;
  accentEmphasis: string;
  dangerFg: string;
  dangerEmphasis: string;
  successFg: string;
  successEmphasis: string;
  attentionFg: string;
  attentionEmphasis: string;

  // Interactive states
  hoverBg: string;
  activeBg: string;
  selectedBg: string;
  focusBorder: string;
}

export const lightTheme: ThemeTokens = {
  // Background
  bgDefault: '#ffffff',
  bgSubtle: '#f6f8fa',
  bgMuted: '#eaeef2',
  bgOverlay: 'rgba(27, 31, 36, 0.5)',
  bgInset: '#f6f8fa',

  // Border
  borderDefault: '#d0d7de',
  borderMuted: '#eaeef2',
  borderSubtle: '#f6f8fa',

  // Text
  textPrimary: '#1f2328',
  textSecondary: '#656d76',
  textTertiary: '#8c959f',
  textLink: '#0969da',
  textDanger: '#d1242f',
  textSuccess: '#1a7f37',
  textWarning: '#9a6700',

  // Components
  canvasDefault: '#ffffff',
  canvasSubtle: '#f6f8fa',
  accentFg: '#0969da',
  accentEmphasis: '#0969da',
  dangerFg: '#d1242f',
  dangerEmphasis: '#cf222e',
  successFg: '#1a7f37',
  successEmphasis: '#1f883d',
  attentionFg: '#9a6700',
  attentionEmphasis: '#bf8700',

  // Interactive
  hoverBg: '#f3f4f6',
  activeBg: '#e5e7eb',
  selectedBg: '#ddf4ff',
  focusBorder: '#0969da',
};

export const darkTheme: ThemeTokens = {
  // Background
  bgDefault: '#0d1117',
  bgSubtle: '#161b22',
  bgMuted: '#21262d',
  bgOverlay: 'rgba(1, 4, 9, 0.8)',
  bgInset: '#010409',

  // Border
  borderDefault: '#30363d',
  borderMuted: '#21262d',
  borderSubtle: '#161b22',

  // Text
  textPrimary: '#e6edf3',
  textSecondary: '#8d96a0',
  textTertiary: '#656d76',
  textLink: '#4493f8',
  textDanger: '#f85149',
  textSuccess: '#3fb950',
  textWarning: '#d29922',

  // Components
  canvasDefault: '#0d1117',
  canvasSubtle: '#161b22',
  accentFg: '#4493f8',
  accentEmphasis: '#1f6feb',
  dangerFg: '#f85149',
  dangerEmphasis: '#da3633',
  successFg: '#3fb950',
  successEmphasis: '#2ea043',
  attentionFg: '#d29922',
  attentionEmphasis: '#bf8700',

  // Interactive
  hoverBg: '#161b22',
  activeBg: '#21262d',
  selectedBg: '#1c2d41',
  focusBorder: '#1f6feb',
};

/**
 * Generate CSS variables for a theme
 */
export const generateCSSVariables = (theme: ThemeTokens): Record<string, string> => {
  return {
    '--gb-bg-default': theme.bgDefault,
    '--gb-bg-subtle': theme.bgSubtle,
    '--gb-bg-muted': theme.bgMuted,
    '--gb-bg-overlay': theme.bgOverlay,
    '--gb-bg-inset': theme.bgInset,

    '--gb-border-default': theme.borderDefault,
    '--gb-border-muted': theme.borderMuted,
    '--gb-border-subtle': theme.borderSubtle,

    '--gb-text-primary': theme.textPrimary,
    '--gb-text-secondary': theme.textSecondary,
    '--gb-text-tertiary': theme.textTertiary,
    '--gb-text-link': theme.textLink,
    '--gb-text-danger': theme.textDanger,
    '--gb-text-success': theme.textSuccess,
    '--gb-text-warning': theme.textWarning,

    '--gb-canvas-default': theme.canvasDefault,
    '--gb-canvas-subtle': theme.canvasSubtle,
    '--gb-accent-fg': theme.accentFg,
    '--gb-accent-emphasis': theme.accentEmphasis,
    '--gb-danger-fg': theme.dangerFg,
    '--gb-danger-emphasis': theme.dangerEmphasis,
    '--gb-success-fg': theme.successFg,
    '--gb-success-emphasis': theme.successEmphasis,
    '--gb-attention-fg': theme.attentionFg,
    '--gb-attention-emphasis': theme.attentionEmphasis,

    '--gb-hover-bg': theme.hoverBg,
    '--gb-active-bg': theme.activeBg,
    '--gb-selected-bg': theme.selectedBg,
    '--gb-focus-border': theme.focusBorder,
  };
};
