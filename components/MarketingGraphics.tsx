
import React, { useState, useCallback, useEffect } from 'react';
import type { BrandingKit, MarketingGraphicSuggestion } from '../types';
import { generateMarketingGraphics } from '../services/geminiService';
import Loader from './Loader';

const graphicCategories = {
    'Social Media Posts': ['Instagram Post (1:1)', 'Instagram Story (9:16)', 'Facebook Post (1.91:1)', 'X/Twitter Post (16:9)'],
    'Social Media Banners': ['LinkedIn Banner (4:1)', 'YouTube Channel Art (16:9)', 'Facebook Cover (2.37:1)'],
    'Digital Ads': ['Google Display Ad - Medium Rectangle (300x250)', 'Google Display Ad - Leaderboard (728x90)'],
};

interface MarketingGraphicsProps {
  brandingKit: BrandingKit;
  onSelectionChange: (selected: string[]) => void;
}

const MarketingGraphics: React.FC<MarketingGraphicsProps> = ({ brandingKit, onSelectionChange }) => {
  const [selectedGraphics, setSelectedGraphics] = useState<Set<string>>(new Set());
  const [generatedGraphics, setGeneratedGraphics] = useState<MarketingGraphicSuggestion[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  useEffect(() => {
    onSelectionChange(Array.from(selectedGraphics));
  }, [selectedGraphics, onSelectionChange]);

  const handleToggleElement = (element: string) => {
    setSelectedGraphics(prev => {
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
        setTimeout(() => setCopiedPrompt(null), 2500);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (selectedGraphics.size === 0) {
      setError('Please select at least one graphic to generate.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedGraphics(null);

    try {
      const result = await generateMarketingGraphics(brandingKit, Array.from(selectedGraphics));
      setGeneratedGraphics(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedGraphics, brandingKit]);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
      <h3 className="text-3xl font-bold text-gray-800 mb-2">Step 4: Generate Marketing Graphics</h3>
      <p className="text-gray-500 mb-6">Select formats for your final asset package. You can also generate design templates here to preview the concepts.</p>

      <div className="space-y-4 mb-6">
        {Object.entries(graphicCategories).map(([category, elements]) => (
            <div key={category}>
                <h4 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1 border-gray-200">{category}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {elements.map(element => (
                        <label key={element} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                checked={selectedGraphics.has(element)}
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
        disabled={isLoading || selectedGraphics.size === 0}
        className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
      >
        {isLoading ? 'Generating Previews...' : `Generate ${selectedGraphics.size} Preview(s)`}
      </button>
      
      {isLoading && <div className="mt-6"><Loader /></div>}

      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
            <p><strong className="font-bold">Error: </strong>{error}</p>
        </div>
      )}

      {generatedGraphics && (
        <div className="mt-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Generated Graphic Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedGraphics.map(graphic => (
                <div key={graphic.graphicName} className="p-4 sm:p-5 bg-gray-50 rounded-lg border border-gray-200 flex flex-col">
                    <h4 className="text-xl font-bold text-indigo-700">{graphic.graphicName}</h4>
                    <p className="mt-2 text-gray-600 text-sm flex-grow">{graphic.description}</p>
                    
                    <div className="my-4 aspect-video bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
                        {graphic.base64Image ? (
                             <img src={`data:image/png;base64,${graphic.base64Image}`} alt={`Preview for ${graphic.graphicName}`} className="w-full h-full object-contain"/>
                        ) : (
                            <span className="text-gray-400 text-sm">Preview not available</span>
                        )}
                    </div>
                    
                    <button
                        onClick={() => handleCopyPrompt(graphic.prompt)}
                        className={`mt-auto flex-shrink-0 text-xs font-bold py-1.5 px-4 rounded-full transition-all duration-200 ease-in-out w-full ${
                            copiedPrompt === graphic.prompt
                            ? 'bg-green-500 text-white cursor-default'
                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                        }`}
                        aria-label={`Copy prompt for: ${graphic.description}`}
                    >
                        {copiedPrompt === graphic.prompt ? 'Copied!' : 'Copy Generation Prompt'}
                    </button>
                </div>
            ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default MarketingGraphics;
