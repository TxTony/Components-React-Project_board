/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MermaidViewer } from '@/components/ContentPanel/MermaidViewer';

describe('MermaidViewer', () => {
  const validDiagram = `graph TD
    A[Start] --> B[Process]
    B --> C[End]`;

  const invalidDiagram = 'invalid mermaid syntax { } [ ]';

  describe('Rendering', () => {
    it('should render mermaid diagrams', () => {
      render(<MermaidViewer diagrams={[validDiagram]} />);
      expect(screen.getByTestId('mermaid-diagram-0')).toBeInTheDocument();
    });

    it('should render multiple diagrams', () => {
      const diagrams = [validDiagram, validDiagram];
      render(<MermaidViewer diagrams={diagrams} />);
      
      expect(screen.getByTestId('mermaid-diagram-0')).toBeInTheDocument();
      expect(screen.getByTestId('mermaid-diagram-1')).toBeInTheDocument();
    });

    it('should show empty state when no diagrams', () => {
      render(<MermaidViewer diagrams={[]} />);
      expect(screen.getByText(/no diagrams/i)).toBeInTheDocument();
    });

    it('should handle error in diagram rendering', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<MermaidViewer diagrams={[invalidDiagram]} />);
      
      expect(screen.getByText(/error rendering diagram/i)).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Diagram Display', () => {
    it('should display diagram with title', () => {
      render(<MermaidViewer diagrams={[validDiagram]} />);
      expect(screen.getByText(/diagram 1/i)).toBeInTheDocument();
    });

    it('should number multiple diagrams correctly', () => {
      render(<MermaidViewer diagrams={[validDiagram, validDiagram]} />);
      expect(screen.getByText(/diagram 1/i)).toBeInTheDocument();
      expect(screen.getByText(/diagram 2/i)).toBeInTheDocument();
    });
  });
});
