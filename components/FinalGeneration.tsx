
import React from 'react';
import type { BrandingKit, FinalAsset, SampleOutcome } from '../types';

interface FinalGenerationProps {
    brandingKit: BrandingKit;
    likedSamples: SampleOutcome[];
    selectedElements: string[];
    selectedGraphics: string[];
    onGenerate: () => void;
    isLoading: boolean;
    finalAssets: FinalAsset[];
    progressText: string | null;
}

const FinalGeneration: React.FC<FinalGenerationProps> = ({ brandingKit, likedSamples, selectedElements, selectedGraphics, onGenerate, isLoading, finalAssets, progressText }) => {
    
    const totalToGenerate = selectedElements.length + selectedGraphics.length;

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
            <h3 className="text-3xl font-bold text-gray-800 mb-2">Step 6: Generate Final Assets</h3>
            <p className="text-gray-500 mb-6">Ready to go! We will generate a full set of assets based on your branding kit and the visual style from your 'liked' samples.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Summary Section */}
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-700 mb-3">Generation Summary</h4>
                    <div className="space-y-3">
                        <div>
                            <h5 className="font-semibold text-gray-600">Website Elements ({selectedElements.length})</h5>
                            {selectedElements.length > 0 ? (
                                <p className="text-sm text-gray-500">{selectedElements.join(', ')}</p>
                            ) : (
                                <p className="text-sm text-gray-400 italic">None selected in Step 3.</p>
                            )}
                        </div>
                         <div>
                            <h5 className="font-semibold text-gray-600">Marketing Graphics ({selectedGraphics.length})</h5>
                            {selectedGraphics.length > 0 ? (
                                <p className="text-sm text-gray-500">{selectedGraphics.join(', ')}</p>
                            ) : (
                                <p className="text-sm text-gray-400 italic">None selected in Step 4.</p>
                            )}
                        </div>
                    </div>
                </div>
                {/* Liked Samples Section */}
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                     <h4 className="text-lg font-semibold text-gray-700 mb-3">Style Reference ({likedSamples.length})</h4>
                     {likedSamples.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {likedSamples.map(sample => (
                                <img 
                                    key={sample.name} 
                                    src={`data:image/png;base64,${sample.generatedImage}`} 
                                    alt={sample.name}
                                    className="w-16 h-16 object-cover rounded-md border-2 border-indigo-200"
                                    title={`Liked: ${sample.name}`}
                                />
                            ))}
                        </div>
                     ) : (
                        <p className="text-sm text-red-500 italic">No 'liked' samples from Step 5. Please go back and select at least one to provide a style reference.</p>
                     )}
                </div>
            </div>


            {!isLoading && finalAssets.length === 0 && (
                <button
                    onClick={onGenerate}
                    disabled={isLoading || totalToGenerate === 0 || likedSamples.length === 0}
                    className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
                >
                    {`Generate ${totalToGenerate} Final Asset(s)`}
                </button>
            )}

            {isLoading && (
                <div className="flex flex-col items-center justify-center space-y-4 my-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
                    <p className="text-gray-600 font-medium">{progressText || 'Starting generation...'}</p>
                </div>
            )}
            
            {finalAssets.length > 0 && (
                 <div className="mt-8">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Your Final Assets</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {finalAssets.map(asset => (
                            <div key={asset.name} className="group relative aspect-square border rounded-lg overflow-hidden shadow-sm">
                                <img src={`data:image/png;base64,${asset.base64Image}`} alt={asset.name} className="w-full h-full object-cover"/>
                                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2">
                                    <p className="text-white text-xs font-semibold truncate">{asset.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinalGeneration;
