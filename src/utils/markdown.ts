/**
 * Markdown Utilities
 * Functions for processing and sanitizing markdown content
 */

/**
 * Parse markdown to HTML (basic implementation)
 * For production, consider using a library like marked or remark
 */
export const parseMarkdown = (markdown: string): string => {
  if (!markdown) return '';

  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Images (must come before links to avoid conflicts)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 1em 0;">');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Code blocks
  html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Line breaks
  html = html.replace(/\n/g, '<br>');

  // Lists
  html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  return html;
};

/**
 * Sanitize HTML to prevent XSS attacks
 * For production, use a library like DOMPurify
 */
export const sanitizeHTML = (html: string): string => {
  if (!html) return '';

  // Remove script tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers (but preserve style attribute for images)
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/gi, '');

  // Remove javascript: protocol (but allow data: for images)
  sanitized = sanitized.replace(/href="javascript:[^"]*"/gi, 'href="#"');
  sanitized = sanitized.replace(/href='javascript:[^']*'/gi, "href='#'");

  return sanitized;
};

/**
 * Convert markdown to safe HTML
 */
export const markdownToHTML = (markdown: string): string => {
  const html = parseMarkdown(markdown);
  return sanitizeHTML(html);
};

/**
 * Extract plain text from markdown
 */
export const markdownToPlainText = (markdown: string): string => {
  if (!markdown) return '';

  let text = markdown;

  // Remove headers
  text = text.replace(/^#+\s+/gim, '');

  // Remove bold/italic
  text = text.replace(/\*\*(.+?)\*\*/g, '$1');
  text = text.replace(/__(.+?)__/g, '$1');
  text = text.replace(/\*(.+?)\*/g, '$1');
  text = text.replace(/_(.+?)_/g, '$1');

  // Remove links (keep text)
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove code blocks
  text = text.replace(/```[^`]+```/g, '');

  // Remove inline code
  text = text.replace(/`([^`]+)`/g, '$1');

  // Remove list markers
  text = text.replace(/^\* /gim, '');
  text = text.replace(/^\d+\. /gim, '');

  return text.trim();
};

/**
 * Count words in markdown
 */
export const countWords = (markdown: string): number => {
  const plainText = markdownToPlainText(markdown);
  if (!plainText) return 0;

  const words = plainText.split(/\s+/).filter((word) => word.length > 0);
  return words.length;
};

/**
 * Truncate markdown to a specified length
 */
export const truncateMarkdown = (markdown: string, maxLength: number): string => {
  const plainText = markdownToPlainText(markdown);
  if (plainText.length <= maxLength) return markdown;

  return plainText.substring(0, maxLength) + '...';
};

/**
 * Generate a preview of markdown content
 */
export const generatePreview = (markdown: string, maxWords: number = 50): string => {
  const plainText = markdownToPlainText(markdown);
  const words = plainText.split(/\s+/);

  if (words.length <= maxWords) return plainText;

  return words.slice(0, maxWords).join(' ') + '...';
};
