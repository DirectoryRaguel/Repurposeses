
import React from 'react';
import type { BrandingKit, SampleOutcome } from '../types';

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


interface OutcomeCardProps {
    outcome: SampleOutcome;
    onGenerate: () => void;
    onUpdate: (update: Partial<SampleOutcome>) => void;
}

const OutcomeCard: React.FC<OutcomeCardProps> = ({ outcome, onGenerate, onUpdate }) => {

    const CardLoader: React.FC = () => (
        <div className="absolute inset-0 bg-gray-50/80 flex flex-col items-center justify-center space-y-2 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="text-gray-500 text-sm font-medium">Generating...</p>
        </div>
    );

    return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                    <span className="text-2xl mr-3" aria-hidden="true">{outcome.icon}</span>
                    <h4 className="text-lg font-bold text-indigo-700">{outcome.name}</h4>
                </div>
                <button
                    onClick={() => onUpdate({ isLiked: !outcome.isLiked })}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${outcome.isLiked ? 'bg-red-100 text-red-500' : 'bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-500'}`}
                    aria-label={outcome.isLiked ? 'Unlike' : 'Like'}
                    title={outcome.isLiked ? 'Unlike' : 'Like'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            <div className="flex-grow aspect-video bg-white rounded-md border border-gray-200 flex items-center justify-center">
                {outcome.generatedImage ? (
                    <img src={`data:image/png;base64,${outcome.generatedImage}`} alt={`Generated mockup for ${outcome.name}`} className="w-full h-full object-contain"/>
                ) : (
                    <span className="text-gray-400 text-xs text-center p-2">Click "Generate" to create a visual sample</span>
                )}
            </div>
            
            <div className="mt-3">
                 <textarea
                    value={outcome.feedback}
                    onChange={(e) => onUpdate({ feedback: e.target.value })}
                    placeholder="Not quite right? Add feedback here..."
                    className="w-full text-xs p-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 resize-y"
                    disabled={outcome.isLoading}
                    rows={2}
                />
            </div>


            {outcome.error && (
                <p className="text-xs text-red-600 mt-2 text-center">{outcome.error}</p>
            )}

            <button
                onClick={onGenerate}
                disabled={outcome.isLoading}
                className="mt-2 w-full bg-indigo-100 text-indigo-700 font-bold py-2 px-4 rounded-lg hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
            >
                {outcome.isLoading ? 'Generating...' : (outcome.generatedImage ? 'Regenerate' : 'Generate')}
            </button>
            {outcome.isLoading && <CardLoader />}
        </div>
    );
};


interface SampleOutcomesProps {
    brandingKit: BrandingKit;
    outcomes: SampleOutcome[];
    onUpdateOutcome: (name: string, update: Partial<SampleOutcome>) => void;
    onRegenerateOutcome: (name: string) => void;
}

const SampleOutcomes: React.FC<SampleOutcomesProps> = ({ outcomes, onUpdateOutcome, onRegenerateOutcome }) => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
      <h3 className="text-3xl font-bold text-gray-800 mb-2">Step 5: Create a Mood Board</h3>
      <p className="text-gray-500 mb-6">Generate mockups to visualize your brand. 'Like' the ones that best match your desired style to guide the final asset creation in the next step.</p>
    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {outcomes.map(outcome => (
            <OutcomeCard
                key={outcome.name}
                outcome={outcome}
                onGenerate={() => onRegenerateOutcome(outcome.name)}
                onUpdate={(update) => onUpdateOutcome(outcome.name, update)}
            />
        ))}
      </div>
    </div>
  );
};

export default SampleOutcomes;
