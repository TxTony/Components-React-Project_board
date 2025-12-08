/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LinksViewer } from '@/components/ContentPanel/LinksViewer';
import type { Link } from '@/types';

describe('LinksViewer', () => {
  const mockLinks: Link[] = [
    {
      id: 'link_1',
      url: 'https://example.com',
      title: 'Example Website',
      description: 'A test website',
    },
    {
      id: 'link_2',
      url: 'https://github.com',
      title: 'GitHub',
      description: 'Code repository',
    },
  ];

  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render list of links', () => {
      render(<LinksViewer links={mockLinks} onChange={mockOnChange} />);
      
      expect(screen.getByText('Example Website')).toBeInTheDocument();
      expect(screen.getByText('GitHub')).toBeInTheDocument();
    });

    it('should show empty state when no links', () => {
      render(<LinksViewer links={[]} onChange={mockOnChange} />);
      expect(screen.getByText(/no links/i)).toBeInTheDocument();
    });

    it('should display link URLs', () => {
      render(<LinksViewer links={mockLinks} onChange={mockOnChange} />);
      
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
      expect(screen.getByText('https://github.com')).toBeInTheDocument();
    });

    it('should display link descriptions', () => {
      render(<LinksViewer links={mockLinks} onChange={mockOnChange} />);
      
      expect(screen.getByText('A test website')).toBeInTheDocument();
      expect(screen.getByText('Code repository')).toBeInTheDocument();
    });

    it('should render add link button', () => {
      render(<LinksViewer links={mockLinks} onChange={mockOnChange} />);
      expect(screen.getByRole('button', { name: /add link/i })).toBeInTheDocument();
    });
  });

  describe('Link Interactions', () => {
    it('should open link in new tab when clicked', () => {
      render(<LinksViewer links={mockLinks} onChange={mockOnChange} />);
      
      const linkElement = screen.getByText('Example Website').closest('a');
      expect(linkElement).toHaveAttribute('href', 'https://example.com');
      expect(linkElement).toHaveAttribute('target', '_blank');
      expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should show delete button for each link', () => {
      render(<LinksViewer links={mockLinks} onChange={mockOnChange} />);
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete link/i });
      expect(deleteButtons).toHaveLength(2);
    });

    it('should call onChange when link is deleted', () => {
      render(<LinksViewer links={mockLinks} onChange={mockOnChange} />);
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete link/i });
      fireEvent.click(deleteButtons[0]);
      
      expect(mockOnChange).toHaveBeenCalledWith([mockLinks[1]]);
    });
  });

  describe('Add Link Form', () => {
    it('should show add link form when add button clicked', () => {
      render(<LinksViewer links={mockLinks} onChange={mockOnChange} />);
      
      const addButton = screen.getByRole('button', { name: /add link/i });
      fireEvent.click(addButton);
      
      expect(screen.getByPlaceholderText(/enter url/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter title/i)).toBeInTheDocument();
    });

    it('should add new link when form is submitted', () => {
      render(<LinksViewer links={mockLinks} onChange={mockOnChange} />);
      
      const addButton = screen.getByRole('button', { name: /add link/i });
      fireEvent.click(addButton);
      
      const urlInput = screen.getByPlaceholderText(/enter url/i);
      const titleInput = screen.getByPlaceholderText(/enter title/i);
      const submitButton = screen.getByRole('button', { name: /save/i });
      
      fireEvent.change(urlInput, { target: { value: 'https://new-link.com' } });
      fireEvent.change(titleInput, { target: { value: 'New Link' } });
      fireEvent.click(submitButton);
      
      expect(mockOnChange).toHaveBeenCalledWith([
        ...mockLinks,
        expect.objectContaining({
          url: 'https://new-link.com',
          title: 'New Link',
        }),
      ]);
    });

    it('should cancel add link form', () => {
      render(<LinksViewer links={mockLinks} onChange={mockOnChange} />);
      
      const addButton = screen.getByRole('button', { name: /add link/i });
      fireEvent.click(addButton);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);
      
      expect(screen.queryByPlaceholderText(/enter url/i)).not.toBeInTheDocument();
    });

    it('should validate URL format', () => {
      render(<LinksViewer links={mockLinks} onChange={mockOnChange} />);
      
      const addButton = screen.getByRole('button', { name: /add link/i });
      fireEvent.click(addButton);
      
      const urlInput = screen.getByPlaceholderText(/enter url/i);
      const submitButton = screen.getByRole('button', { name: /save/i });
      
      fireEvent.change(urlInput, { target: { value: 'invalid-url' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/invalid url/i)).toBeInTheDocument();
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });
});
