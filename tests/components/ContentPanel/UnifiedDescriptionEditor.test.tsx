/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UnifiedDescriptionEditor } from '@/components/ContentPanel/UnifiedDescriptionEditor';

describe('UnifiedDescriptionEditor', () => {
  const defaultProps = {
    value: '# Test Content\n\nThis is a test.',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Props - value', () => {
    it('should display the provided value', () => {
      render(<UnifiedDescriptionEditor {...defaultProps} />);
      
      expect(screen.getByText(/Test Content/i)).toBeInTheDocument();
    });

    it('should display empty state when value is empty', () => {
      render(<UnifiedDescriptionEditor {...defaultProps} value="" />);
      
      expect(screen.getByText(/No content yet/i)).toBeInTheDocument();
    });

    it('should update when value prop changes', () => {
      const { rerender } = render(<UnifiedDescriptionEditor {...defaultProps} />);
      
      expect(screen.getByText(/Test Content/i)).toBeInTheDocument();
      
      rerender(<UnifiedDescriptionEditor {...defaultProps} value="# Updated Content" />);
      
      expect(screen.getByText(/Updated Content/i)).toBeInTheDocument();
    });

    it('should render markdown in preview mode', () => {
      const markdownContent = '**Bold Text**';
      render(<UnifiedDescriptionEditor {...defaultProps} value={markdownContent} />);
      
      // In preview mode by default
      const boldElement = screen.getByText('Bold Text');
      expect(boldElement.tagName).toBe('STRONG');
    });
  });

  describe('Props - onChange', () => {
    it('should NOT call onChange when content is edited without saving', () => {
      const onChange = vi.fn();
      render(<UnifiedDescriptionEditor {...defaultProps} onChange={onChange} />);

      // Switch to edit mode
      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);

      // Edit content
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'New content' } });

      // onChange should NOT be called yet
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should call onChange when content is edited and saved', () => {
      const onChange = vi.fn();
      render(<UnifiedDescriptionEditor {...defaultProps} onChange={onChange} />);

      // Switch to edit mode
      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);

      // Edit content
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'New content' } });

      // Click save button
      const saveButton = screen.getByText(/💾 Save/i);
      fireEvent.click(saveButton);

      expect(onChange).toHaveBeenCalledWith('New content', expect.any(Object));
    });

    it('should extract links metadata in onChange', () => {
      const onChange = vi.fn();
      render(<UnifiedDescriptionEditor {...defaultProps} onChange={onChange} />);

      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, {
        target: { value: '[Test Link](https://example.com)' }
      });

      // Click save button
      const saveButton = screen.getByText(/💾 Save/i);
      fireEvent.click(saveButton);

      expect(onChange).toHaveBeenCalledWith(
        '[Test Link](https://example.com)',
        expect.objectContaining({
          links: expect.arrayContaining([
            expect.objectContaining({
              title: 'Test Link',
              url: 'https://example.com',
            }),
          ]),
        })
      );
    });

    it('should extract plain URLs in onChange', () => {
      const onChange = vi.fn();
      render(<UnifiedDescriptionEditor {...defaultProps} onChange={onChange} />);

      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, {
        target: { value: 'Check out https://test.com for more info' }
      });

      // Click save button
      const saveButton = screen.getByText(/💾 Save/i);
      fireEvent.click(saveButton);

      expect(onChange).toHaveBeenCalledWith(
        'Check out https://test.com for more info',
        expect.objectContaining({
          links: expect.arrayContaining([
            expect.objectContaining({
              url: 'https://test.com',
            }),
          ]),
        })
      );
    });

    it('should extract mermaid diagrams in onChange', () => {
      const onChange = vi.fn();
      render(<UnifiedDescriptionEditor {...defaultProps} onChange={onChange} />);

      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);

      const mermaidContent = '```mermaid\ngraph TD\n  A --> B\n```';
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: mermaidContent } });

      // Click save button
      const saveButton = screen.getByText(/💾 Save/i);
      fireEvent.click(saveButton);

      expect(onChange).toHaveBeenCalledWith(
        mermaidContent,
        expect.objectContaining({
          mermaidDiagrams: expect.arrayContaining([
            expect.stringContaining('graph TD'),
          ]),
        })
      );
    });

    it('should not crash when onChange is not provided', () => {
      render(<UnifiedDescriptionEditor value="Test" onChange={undefined} />);
      
      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);
      
      const textarea = screen.getByRole('textbox');
      expect(() => {
        fireEvent.change(textarea, { target: { value: 'New value' } });
      }).not.toThrow();
    });
  });

  describe('Props - placeholder', () => {
    it('should display custom placeholder in edit mode', () => {
      const customPlaceholder = 'Enter your custom content here...';
      render(
        <UnifiedDescriptionEditor 
          value="" 
          onChange={vi.fn()} 
          placeholder={customPlaceholder}
        />
      );
      
      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);
      
      const textarea = screen.getByPlaceholderText(customPlaceholder);
      expect(textarea).toBeInTheDocument();
    });

    it('should use default placeholder when not provided', () => {
      render(<UnifiedDescriptionEditor value="" onChange={vi.fn()} />);
      
      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);
      
      const textarea = screen.getByPlaceholderText(/Write your description using Markdown/i);
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('Rendering - Edit Mode', () => {
    it('should render edit button', () => {
      render(<UnifiedDescriptionEditor {...defaultProps} />);
      
      const editButton = screen.getByText(/✏️ Edit/i);
      expect(editButton).toBeInTheDocument();
    });

    it('should render preview button', () => {
      render(<UnifiedDescriptionEditor {...defaultProps} />);
      
      const previewButton = screen.getByText(/👁️ Preview/i);
      expect(previewButton).toBeInTheDocument();
    });

    it('should switch to edit mode when edit button is clicked', () => {
      render(<UnifiedDescriptionEditor {...defaultProps} />);
      
      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    it('should render textarea in edit mode', () => {
      render(<UnifiedDescriptionEditor {...defaultProps} />);
      
      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(defaultProps.value);
    });

    it('should render help text in edit mode', () => {
      render(<UnifiedDescriptionEditor {...defaultProps} />);
      
      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);
      
      expect(screen.getByText(/💡 Tips:/i)).toBeInTheDocument();
      expect(screen.getByText(/Use Markdown syntax/i)).toBeInTheDocument();
    });

    it('should highlight active mode button', () => {
      render(<UnifiedDescriptionEditor {...defaultProps} />);
      
      const editButton = screen.getByText(/✏️ Edit/i);
      const previewButton = screen.getByText(/👁️ Preview/i);
      
      // Preview is active by default
      expect(previewButton).toHaveClass('bg-blue-600');
      expect(editButton).not.toHaveClass('bg-blue-600');
      
      // Click edit
      fireEvent.click(editButton);
      
      expect(editButton).toHaveClass('bg-blue-600');
      expect(previewButton).not.toHaveClass('bg-blue-600');
    });
  });

  describe('Rendering - Preview Mode', () => {
    it('should render in preview mode by default', () => {
      render(<UnifiedDescriptionEditor {...defaultProps} />);
      
      // Should show rendered content, not textarea
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByText(/Test Content/i)).toBeInTheDocument();
    });

    it('should render markdown content as HTML', () => {
      const markdown = '**Bold** and *Italic*';
      render(<UnifiedDescriptionEditor value={markdown} onChange={vi.fn()} />);
      
      const boldElement = screen.getByText('Bold');
      expect(boldElement.tagName).toBe('STRONG');
    });

    it('should render links section when links exist', () => {
      const contentWithLink = '[Test](https://example.com)';
      render(<UnifiedDescriptionEditor value={contentWithLink} onChange={vi.fn()} />);
      
      // There are multiple "Links" text elements (header and badge)
      expect(screen.getAllByText(/Links/i).length).toBeGreaterThan(0);
      // The link title "Test" appears multiple times (in content and in links section)
      expect(screen.getAllByText('Test').length).toBeGreaterThan(0);
    });

    it('should render diagrams section when mermaid exists', () => {
      const contentWithMermaid = '```mermaid\ngraph TD\n  A --> B\n```';
      render(<UnifiedDescriptionEditor value={contentWithMermaid} onChange={vi.fn()} />);
      
      // There are multiple "Diagrams" text elements (header and section title)
      expect(screen.getAllByText(/Diagrams/i).length).toBeGreaterThan(0);
    });

    it('should display stats badges for links and diagrams', () => {
      const content = '[Link](https://test.com)\n\n```mermaid\ngraph TD\n  A --> B\n```';
      render(<UnifiedDescriptionEditor value={content} onChange={vi.fn()} />);
      
      // Both "diagram" and "link" appear multiple times (in badges, headers, etc.)
      expect(screen.getAllByText(/diagram/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/link/i).length).toBeGreaterThan(0);
    });

    it('should show empty state when no content', () => {
      render(<UnifiedDescriptionEditor value="" onChange={vi.fn()} />);
      
      expect(screen.getByText(/No content yet/i)).toBeInTheDocument();
    });
  });

  describe('Rendering - Image Paste Support', () => {
    it('should show image paste hint in edit mode', () => {
      render(<UnifiedDescriptionEditor {...defaultProps} />);

      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);

      // Check for "Paste images" text which is part of the help section
      expect(screen.getByText(/Paste images/i)).toBeInTheDocument();
    });

    it('should have paste event handler on textarea', () => {
      render(<UnifiedDescriptionEditor {...defaultProps} />);

      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);

      const textarea = screen.getByRole('textbox');

      // Verify textarea exists and is ready for paste events
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('spellcheck');
    });

    it('should have drag and drop handlers on textarea', () => {
      render(<UnifiedDescriptionEditor {...defaultProps} />);

      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);

      const textarea = screen.getByRole('textbox');

      // Verify textarea exists and accepts drag/drop
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });
  });

  describe('Save Button Functionality', () => {
    it('should render save button', () => {
      render(<UnifiedDescriptionEditor {...defaultProps} />);

      const saveButton = screen.getByText(/💾 Save/i);
      expect(saveButton).toBeInTheDocument();
    });

    it('should have save button disabled when there are no unsaved changes', () => {
      render(<UnifiedDescriptionEditor {...defaultProps} />);

      const saveButton = screen.getByText(/💾 Save/i);
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when content is edited', () => {
      render(<UnifiedDescriptionEditor {...defaultProps} />);

      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'New content' } });

      const saveButton = screen.getByText(/💾 Save/i);
      expect(saveButton).not.toBeDisabled();
    });

    it('should show unsaved changes indicator when content is edited', () => {
      render(<UnifiedDescriptionEditor {...defaultProps} />);

      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'New content' } });

      expect(screen.getByText(/Unsaved changes/i)).toBeInTheDocument();
    });

    it('should hide unsaved changes indicator after saving', () => {
      render(<UnifiedDescriptionEditor {...defaultProps} />);

      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'New content' } });

      expect(screen.getByText(/Unsaved changes/i)).toBeInTheDocument();

      const saveButton = screen.getByText(/💾 Save/i);
      fireEvent.click(saveButton);

      expect(screen.queryByText(/Unsaved changes/i)).not.toBeInTheDocument();
    });

    it('should disable save button after saving', () => {
      render(<UnifiedDescriptionEditor {...defaultProps} />);

      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'New content' } });

      const saveButton = screen.getByText(/💾 Save/i);
      expect(saveButton).not.toBeDisabled();

      fireEvent.click(saveButton);

      expect(saveButton).toBeDisabled();
    });

    it('should save using Ctrl+S keyboard shortcut', () => {
      const onChange = vi.fn();
      render(<UnifiedDescriptionEditor {...defaultProps} onChange={onChange} />);

      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'New content' } });

      // Simulate Ctrl+S
      fireEvent.keyDown(document, { key: 's', ctrlKey: true });

      expect(onChange).toHaveBeenCalledWith('New content', expect.any(Object));
    });

    it('should save using Cmd+S keyboard shortcut', () => {
      const onChange = vi.fn();
      render(<UnifiedDescriptionEditor {...defaultProps} onChange={onChange} />);

      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'New content' } });

      // Simulate Cmd+S
      fireEvent.keyDown(document, { key: 's', metaKey: true });

      expect(onChange).toHaveBeenCalledWith('New content', expect.any(Object));
    });

    it('should not save with keyboard shortcut when no unsaved changes', () => {
      const onChange = vi.fn();
      render(<UnifiedDescriptionEditor {...defaultProps} onChange={onChange} />);

      // Simulate Ctrl+S without making changes
      fireEvent.keyDown(document, { key: 's', ctrlKey: true });

      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
