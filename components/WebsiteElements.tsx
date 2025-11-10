
import React, { useState, useCallback, useEffect } from 'react';
import type { BrandingKit, WebsiteElementSuggestion } from '../types';
import { generateWebsiteElements } from '../services/geminiService';
import Loader from './Loader';

const elementCategories = {
    'Core UI': ['Icons', 'Buttons', 'Toggle switches/check boxes/radio buttons', 'Progress bars/loaders/spinners'],
    'Layout & Navigation': ['Hero images', 'Dividers/separators', 'Tabs/accordions', 'Footers with pictorial motifs', 'Breadcrumbs'],
    'Content Display': ['Image galleries/carousels/sliders', 'Video thumbnails/players', 'Charts/graphs', 'Avatars/profile images'],
    'Feedback & Interaction': ['Badges/icons for notifications', 'Call-to-action (CTA) visual blocks'],
    'Decorative': ['Illustrations', 'Background patterns/textures', 'Decorative flourishes'],
};

interface WebsiteElementsProps {
  brandingKit: BrandingKit;
  onSelectionChange: (selected: string[]) => void;
}

const WebsiteElements: React.FC<WebsiteElementsProps> = ({ brandingKit, onSelectionChange }) => {
  const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set());
  const [generatedElements, setGeneratedElements] = useState<WebsiteElementSuggestion[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  useEffect(() => {
    onSelectionChange(Array.from(selectedElements));
  }, [selectedElements, onSelectionChange]);


  const handleToggleElement = (element: string) => {
    setSelectedElements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(element)) {
        newSet.delete(element);
      } else {
        newSet.add(element);
      }
      return newSet;
    });
  };

  const handleCopyPrompt = useCallback((promptText: string) => {
    navigator.clipboard.writeText(promptText).then(() => {
        setCopiedPrompt(promptText);
        setTimeout(() => setCopiedPrompt(null), 2500); // Reset after 2.5 seconds
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  }, []);


  const handleGenerate = useCallback(async () => {
    if (selectedElements.size === 0) {
      setError('Please select at least one element to generate.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedElements(null);

    try {
      const result = await generateWebsiteElements(brandingKit, Array.from(selectedElements));
      setGeneratedElements(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedElements, brandingKit]);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
      <h3 className="text-3xl font-bold text-gray-800 mb-2">Step 3: Generate Website Elements</h3>
      <p className="text-gray-500 mb-6">Select the elements you need for your final asset package. You can also generate design ideas here to preview the concepts.</p>

      <div className="space-y-4 mb-6">
        {Object.entries(elementCategories).map(([category, elements]) => (
            <div key={category}>
                <h4 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1 border-gray-200">{category}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {elements.map(element => (
                        <label key={element} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                checked={selectedElements.has(element)}
                                onChange={() => handleToggleElement(element)}
                            />
                            <span className="text-sm text-gray-600">{element}</span>
                        </label>
                    ))}
                </div>
            </div>
        ))}
      </div>

      <button
        onClick={handleGenerate}
        disabled={isLoading || selectedElements.size === 0}
        className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
      >
        {isLoading ? 'Generating Previews...' : `Generate ${selectedElements.size} Preview(s)`}
      </button>

      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
            <p><strong className="font-bold">Error: </strong>{error}</p>
        </div>
      )}
      
      {isLoading && <div className="mt-6"><Loader /></div>}

      {generatedElements && (
        <div className="mt-8 space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800">Generated Element Designs</h3>
            {generatedElements.map(element => (
                <div key={element.elementName} className="p-4 sm:p-5 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-xl font-bold text-indigo-700">{element.elementName}</h4>
                    <p className="mt-2 text-gray-600">{element.description}</p>
                    <div className="mt-4">
                        <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Visual Ideas</h5>
                        <ul className="list-none pl-0 mt-2 space-y-3">
                            {element.visualIdeas.map((idea, i) => (
                                <li key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white rounded-md border border-gray-200 shadow-sm">
                                    <p className="text-gray-700 pr-4 mb-2 sm:mb-0">{idea.description}</p>
                                    <button
                                        onClick={() => handleCopyPrompt(idea.prompt)}
                                        className={`flex-shrink-0 text-xs font-bold py-1.5 px-4 rounded-full transition-all duration-200 ease-in-out w-full sm:w-auto ${
                                            copiedPrompt === idea.prompt
                                            ? 'bg-green-500 text-white cursor-default'
                                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                        }`}
                                        aria-label={`Copy prompt for: ${idea.description}`}
                                    >
                                        {copiedPrompt === idea.prompt ? 'Copied!' : 'Copy Prompt'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default WebsiteElements;
