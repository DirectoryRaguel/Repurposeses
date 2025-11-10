
import React, { useState, useCallback, useMemo } from 'react';
import Header from './components/Header';
import Loader from './components/Loader';
import ColorPalette from './components/ColorPalette';
import LogoIdeas from './components/LogoIdeas';
import TypographyScale from './components/TypographyScale';
import TaskList from './components/TaskList';
import WebsiteElements from './components/WebsiteElements';
import MarketingGraphics from './components/MarketingGraphics';
import Stepper from './components/Stepper';
import InspirationUploader from './components/InspirationUploader';
import SampleOutcomes from './components/SampleOutcomes';
import FinalGeneration from './components/FinalGeneration';
import { generateBranding, regenerateLogoIdeas, regenerateColorPalette, generateSampleOutcome, generateFinalAssetImage } from './services/geminiService';
import type { BrandingKit, Task, SampleOutcome, FinalAsset } from './types';

interface TabButtonProps {
    title: string;
    active: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ title, active, onClick }) => (
    <button
        onClick={onClick}
        className={`py-2 px-4 text-sm sm:text-base font-medium transition-colors duration-200 -mb-px border-b-2 ${
            active 
            ? 'border-indigo-500 text-indigo-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
        aria-selected={active}
        role="tab"
    >
        {title}
    </button>
);

const outcomeCategories = [
    { name: 'Website Mockup', icon: '💻' },
    { name: 'Business Card', icon: '📇' },
    { name: 'Social Media Profile', icon: '📱' },
    { name: 'App Icon', icon: '🎨' },
    { name: 'T-Shirt Mockup', icon: '👕' },
    { name: 'Coffee Mug', icon: '☕' },
    { name: 'Mobile App Screen', icon: '📲' },
    { name: 'Landing Page Section', icon: '📄' },
];

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [mode, setMode] = useState<'describe' | 'url'>('describe');
  const [description, setDescription] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [brandingKit, setBrandingKit] = useState<BrandingKit | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRegeneratingLogos, setIsRegeneratingLogos] = useState<boolean>(false);
  const [isRegeneratingPalette, setIsRegeneratingPalette] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inspirationLogo, setInspirationLogo] = useState<File | null>(null);
  const [inspirationImages, setInspirationImages] = useState<File[]>([]);
  
  const [selectedWebsiteElements, setSelectedWebsiteElements] = useState<string[]>([]);
  const [selectedMarketingGraphics, setSelectedMarketingGraphics] = useState<string[]>([]);
  const [finalAssets, setFinalAssets] = useState<FinalAsset[]>([]);
  const [finalGenerationProgress, setFinalGenerationProgress] = useState<string | null>(null);

  const [sampleOutcomes, setSampleOutcomes] = useState<SampleOutcome[]>(
    outcomeCategories.map(cat => ({
        ...cat,
        generatedImage: null,
        isLoading: false,
        error: null,
        isLiked: false,
        feedback: ''
    }))
  );

  const handleGenerate = useCallback(async () => {
    const input = mode === 'describe' ? description.trim() : url.trim();
    if (!input) {
      setError(mode === 'describe' ? 'Please describe your website or brand.' : 'Please enter a URL.');
      return;
    }
    
    if (mode === 'url') {
      try {
        if (!input.startsWith('http://') && !input.startsWith('https://')) { throw new Error('Invalid URL'); }
        new URL(input);
      } catch (_) {
        setError('Please enter a valid URL (e.g., https://example.com).');
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setBrandingKit(null);

    try {
      const params = mode === 'describe' 
        ? { type: 'description' as const, value: description }
        : { type: 'url' as const, value: url };
      
      const inspiration = {
        logo: mode === 'describe' ? inspirationLogo : null,
        images: mode === 'describe' ? inspirationImages : []
      };

      const result = await generateBranding(params, inspiration);
      setBrandingKit(result);
      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [description, url, mode, inspirationLogo, inspirationImages]);

  const handleRegenerateLogos = useCallback(async (feedback: string) => {
    if (!brandingKit) return;
    setIsRegeneratingLogos(true);
    setError(null);
    try {
        const originalInput = mode === 'describe' ? { type: 'description' as const, value: description } : { type: 'url' as const, value: url };
        const { logoIdeas, ...restOfKit } = brandingKit;
        const newLogoIdeas = await regenerateLogoIdeas(originalInput, restOfKit, feedback);
        setBrandingKit(prev => prev ? { ...prev, logoIdeas: newLogoIdeas } : null);
    } catch (err) {
        setError(err instanceof Error ? `Logo Regeneration Failed: ${err.message}` : 'An unexpected error occurred during logo regeneration.');
    } finally {
        setIsRegeneratingLogos(false);
    }
  }, [brandingKit, mode, description, url]);

  const handleRegeneratePalette = useCallback(async (theme: string) => {
    if (!brandingKit) return;
    setIsRegeneratingPalette(true);
    setError(null);
    try {
        const originalInput = mode === 'describe' ? { type: 'description' as const, value: description } : { type: 'url' as const, value: url };
        const { colorPalette, ...restOfKit } = brandingKit;
        const newColors = await regenerateColorPalette(originalInput, restOfKit, theme);
        setBrandingKit(prev => prev ? { ...prev, colorPalette: newColors } : null);
    } catch (err) {
        setError(err instanceof Error ? `Palette Regeneration Failed: ${err.message}` : 'An unexpected error occurred during palette regeneration.');
    } finally {
        setIsRegeneratingPalette(false);
    }
  }, [brandingKit, mode, description, url]);

  const handleUpdateOutcome = (name: string, update: Partial<SampleOutcome>) => {
      setSampleOutcomes(prev => prev.map(o => o.name === name ? { ...o, ...update } : o));
  };

  const handleRegenerateOutcome = useCallback(async (name: string) => {
      const outcome = sampleOutcomes.find(o => o.name === name);
      if (!brandingKit || !outcome) return;

      handleUpdateOutcome(name, { isLoading: true, error: null });
      try {
          const newImage = await generateSampleOutcome(brandingKit, name, outcome.feedback);
          handleUpdateOutcome(name, { generatedImage: newImage, isLoading: false });
      } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to regenerate';
          handleUpdateOutcome(name, { error: errorMessage, isLoading: false });
      }
  }, [brandingKit, sampleOutcomes]);
  
  const handleGenerateFinalAssets = useCallback(async () => {
    if (!brandingKit) return;
    setIsLoading(true);
    setFinalAssets([]);
    setError(null);

    const likedSamples = sampleOutcomes
        .filter(o => o.isLiked && o.generatedImage)
        .map(o => ({ name: o.name, image: o.generatedImage! }));

    if (likedSamples.length === 0) {
        setError("Please 'like' at least one sample outcome in Step 5 to provide a style reference.");
        setIsLoading(false);
        return;
    }

    const allItemsToGenerate = [
        ...selectedWebsiteElements.map(name => ({ name, type: 'element' as const })),
        ...selectedMarketingGraphics.map(name => ({ name, type: 'graphic' as const }))
    ];
    
    if (allItemsToGenerate.length === 0) {
        setError("Please select at least one Website Element or Marketing Graphic in steps 3 or 4.");
        setIsLoading(false);
        return;
    }

    try {
        for (let i = 0; i < allItemsToGenerate.length; i++) {
            const item = allItemsToGenerate[i];
            setFinalGenerationProgress(`Generating ${item.name} (${i + 1} of ${allItemsToGenerate.length})`);
            const newImage = await generateFinalAssetImage(brandingKit, likedSamples, item.name, item.type);
            setFinalAssets(prev => [...prev, { ...item, base64Image: newImage }]);
        }
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred during final generation.');
    } finally {
        setIsLoading(false);
        setFinalGenerationProgress(null);
    }
  }, [brandingKit, sampleOutcomes, selectedWebsiteElements, selectedMarketingGraphics]);


  const handleAddTask = (idea: string) => { setTasks(prev => [...prev, { id: Date.now(), text: `Develop logo concept: ${idea}` }]); };
  const handleRemoveTask = (taskId: number) => { setTasks(prev => prev.filter(task => task.id !== taskId)); };
  const setStep = (step: number) => { if (step < currentStep) { setCurrentStep(step); } };

  const renderStep1 = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 sm:px-8 pt-6">
          <div className="flex border-b border-gray-200">
            <TabButton title="Describe Brand" active={mode === 'describe'} onClick={() => setMode('describe')} />
            <TabButton title="Analyze URL" active={mode === 'url'} onClick={() => setMode('url')} />
          </div>
      </div>
      <div className="p-6 sm:p-8">
        {mode === 'describe' ? (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-1">Describe Your Brand</h2>
            <p className="text-gray-500 mb-4">Tell us about your website, product, or idea. The more detail, the better the branding kit.</p>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., A modern, minimalist coffee subscription box for remote workers..." className="w-full h-32 p-4 bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 resize-y" disabled={isLoading} aria-label="Brand description" />
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-1">Analyze by URL</h2>
            <p className="text-gray-500 mb-4">Enter a public URL and we'll analyze it to generate a fitting brand identity.</p>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="e.g., https://your-awesome-project.com" className="w-full p-4 bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200" disabled={isLoading} aria-label="Website URL" />
          </div>
        )}
        {mode === 'describe' && <InspirationUploader logo={inspirationLogo} images={inspirationImages} onLogoChange={setInspirationLogo} onImagesChange={setInspirationImages} disabled={isLoading} />}
        <button onClick={handleGenerate} disabled={isLoading || (mode === 'describe' && !description.trim()) || (mode === 'url' && !url.trim())} className="mt-6 w-full sm:w-auto bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100">
          {isLoading ? 'Generating...' : 'Generate Branding'}
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => brandingKit && (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <ColorPalette colors={brandingKit.colorPalette} onUpdatePalette={(newPalette) => setBrandingKit({...brandingKit, colorPalette: newPalette})} onRegeneratePalette={handleRegeneratePalette} isRegenerating={isRegeneratingPalette} />
          <TypographyScale typography={brandingKit.typography} onUpdateTypography={(newTypography) => setBrandingKit({...brandingKit, typography: newTypography})} />
          <LogoIdeas ideas={brandingKit.logoIdeas} onRegenerate={handleRegenerateLogos} onAddTask={handleAddTask} isRegenerating={isRegeneratingLogos} />
        </div>
        <div className="lg:col-span-1 lg:sticky lg:top-8">
           <TaskList tasks={tasks} onRemoveTask={handleRemoveTask} />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => brandingKit && <WebsiteElements brandingKit={brandingKit} onSelectionChange={setSelectedWebsiteElements} />;
  const renderStep4 = () => brandingKit && <MarketingGraphics brandingKit={brandingKit} onSelectionChange={setSelectedMarketingGraphics} />;
  const renderStep5 = () => brandingKit && <SampleOutcomes brandingKit={brandingKit} outcomes={sampleOutcomes} onUpdateOutcome={handleUpdateOutcome} onRegenerateOutcome={handleRegenerateOutcome} />;
  const renderStep6 = () => brandingKit && <FinalGeneration brandingKit={brandingKit} likedSamples={sampleOutcomes.filter(o => o.isLiked)} selectedElements={selectedWebsiteElements} selectedGraphics={selectedMarketingGraphics} onGenerate={handleGenerateFinalAssets} isLoading={isLoading} finalAssets={finalAssets} progressText={finalGenerationProgress} />;

  const renderCurrentStep = () => {
    if (isLoading && !brandingKit) return <Loader />;
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return renderStep1();
    }
  };

  const NavigationButtons = () => (
    <div className="mt-8 flex justify-between items-center">
        <button onClick={() => setCurrentStep(currentStep - 1)} disabled={currentStep <= 1} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            Back
        </button>
        {currentStep < 6 && (
            <button onClick={() => setCurrentStep(currentStep + 1)} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 transition-all" disabled={!brandingKit}>
                Next
            </button>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Header />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {currentStep > 1 && brandingKit && ( <div className="p-4 sm:p-6 bg-white rounded-xl shadow-md mb-8"> <Stepper currentStep={currentStep} setStep={setStep} /> </div> )}
        
        {error && ( <div className="my-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert"> <strong className="font-bold">Error: </strong> <span className="block sm:inline">{error}</span> <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Close error message"> <span className="text-2xl">&times;</span> </button> </div> )}

        {renderCurrentStep()}
        
        {brandingKit && currentStep > 1 && currentStep < 6 && <NavigationButtons />}

      </main>
      <footer className="text-center py-6 text-gray-400 text-sm"> <p>Powered by Google Gemini</p> </footer>
    </div>
  );
};

export default App;
