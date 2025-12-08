/**
 * MermaidViewer Component
 * Renders Mermaid diagrams with error handling
 */

import React, { useEffect, useRef, useState } from 'react';

export interface MermaidViewerProps {
  diagrams: string[];
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ diagrams }) => {
  const [errors, setErrors] = useState<Record<number, string>>({});
  const diagramRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Dynamically import mermaid only when needed
    const renderDiagrams = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
        });

        // Render each diagram
        diagrams.forEach(async (diagram, index) => {
          const element = diagramRefs.current[index];
          if (!element) return;

          try {
            // Clear previous content
            element.innerHTML = diagram;
            
            // Generate unique ID for each diagram
            const id = `mermaid-diagram-${index}-${Date.now()}`;
            
            // Render the diagram
            const { svg } = await mermaid.render(id, diagram);
            element.innerHTML = svg;
            
            // Clear error if it was previously set
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[index];
              return newErrors;
            });
          } catch (error) {
            console.error('Error rendering mermaid diagram:', error);
            setErrors((prev) => ({
              ...prev,
              [index]: error instanceof Error ? error.message : 'Unknown error',
            }));
          }
        });
      } catch (error) {
        console.error('Error loading mermaid library:', error);
      }
    };

    if (diagrams.length > 0) {
      renderDiagrams();
    }
  }, [diagrams]);

  if (diagrams.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
        No diagrams to display
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Mermaid Diagrams
      </h3>
      
      {diagrams.map((diagram, index) => (
        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
            Diagram {index + 1}
          </div>
          
          {errors[index] ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-2">
                Error rendering diagram
              </p>
              <pre className="text-xs text-red-500 dark:text-red-300 overflow-x-auto">
                {errors[index]}
              </pre>
            </div>
          ) : (
            <div
              ref={(el) => (diagramRefs.current[index] = el)}
              data-testid={`mermaid-diagram-${index}`}
              className="mermaid-container flex items-center justify-center bg-white dark:bg-gray-800 rounded"
            />
          )}
          
          {/* Show raw diagram code */}
          <details className="mt-4">
            <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
              View source
            </summary>
            <pre className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded text-xs overflow-x-auto">
              {diagram}
            </pre>
          </details>
        </div>
      ))}
    </div>
  );
};

MermaidViewer.displayName = 'MermaidViewer';
