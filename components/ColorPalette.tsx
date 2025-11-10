import React, { useState, useRef } from 'react';
import type { Color } from '../types';
import { getColorName } from '../services/geminiService';
import EditableField from './EditableField';

interface ColorPaletteProps {
  colors: Color[];
  onUpdatePalette: (newPalette: Color[]) => void;
  onRegeneratePalette: (theme: string) => void;
  isRegenerating: boolean;
}

const ColorSwatch: React.FC<{
    color: Color;
    onColorChange: (newHex: string) => void;
    onNameChange: (newName: string) => void;
    isNameLoading: boolean;
}> = ({ color, onColorChange, onNameChange, isNameLoading }) => {
    const colorInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="text-center group">
            <div
                className="w-full h-24 rounded-lg shadow-inner cursor-pointer transition-transform transform group-hover:-translate-y-1"
                style={{ backgroundColor: color.hex }}
                onClick={() => colorInputRef.current?.click()}
                title={`Click to pick a new color for ${color.name}`}
            >
                <input
                    ref={colorInputRef}
                    type="color"
                    value={color.hex}
                    onChange={(e) => onColorChange(e.target.value)}
                    className="opacity-0 w-0 h-0"
                    aria-label={`Change color for ${color.name}`}
                />
            </div>
            <div className="mt-2 text-sm truncate">
                 {isNameLoading ? (
                    <span className="text-gray-400 italic">...</span>
                ) : (
                    <EditableField
                        value={color.name}
                        onUpdate={onNameChange}
                        className="font-medium text-gray-700 text-sm truncate -m-1 p-1 hover:bg-gray-100 rounded"
                        inputClassName="w-full text-center text-sm font-medium bg-indigo-50 rounded -m-1 p-1 outline-none focus:ring-2 ring-indigo-400"
                    />
                )}
            </div>
            <p className="text-gray-500 text-xs font-mono">{color.hex.toUpperCase()}</p>
        </div>
    );
};


const ColorPalette: React.FC<ColorPaletteProps> = ({ colors, onUpdatePalette, onRegeneratePalette, isRegenerating }) => {
    const [nameLoadingIndex, setNameLoadingIndex] = useState<number | null>(null);

    const handleColorChange = async (newHex: string, index: number) => {
        const originalName = colors[index].name;

        // Immediately update the hex value for instant visual feedback
        const updatedPaletteWithHex = colors.map((c, i) => i === index ? { ...c, hex: newHex } : c);
        onUpdatePalette(updatedPaletteWithHex);

        setNameLoadingIndex(index);
        try {
            const newName = await getColorName(newHex);
            const finalPalette = colors.map((c, i) => i === index ? { name: newName, hex: newHex } : c);
            onUpdatePalette(finalPalette);
        } catch (error) {
            console.error("Failed to get color name, keeping original.", error);
            // On failure, keep the original name with the new color
            const fallbackPalette = colors.map((c, i) => i === index ? { name: originalName, hex: newHex } : c);
            onUpdatePalette(fallbackPalette);
        } finally {
            setNameLoadingIndex(null);
        }
    };

    const handleNameChange = (newName: string, index: number) => {
        const newPalette = colors.map((c, i) => i === index ? { ...c, name: newName } : c);
        onUpdatePalette(newPalette);
    };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Color Palette</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {colors.map((color, index) => (
          <ColorSwatch
            key={`${color.hex}-${index}`}
            color={color}
            onColorChange={(newHex) => handleColorChange(newHex, index)}
            onNameChange={(newName) => handleNameChange(newName, index)}
            isNameLoading={nameLoadingIndex === index}
          />
        ))}
      </div>
       <p className="text-xs text-gray-400 mt-4 text-center">Click a color swatch to use the color picker, or click a name to edit it.</p>
    
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-700">Regenerate Palette</h4>
          <p className="text-gray-500 text-sm mt-1 mb-3">Try a new set of colors with a different feel.</p>
          <div className="flex flex-wrap gap-2">
            {['Vibrant', 'Muted', 'Professional', 'Playful'].map(theme => (
                <button
                    key={theme}
                    onClick={() => onRegeneratePalette(theme)}
                    disabled={isRegenerating}
                    className="flex-grow sm:flex-grow-0 bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
                >
                    {isRegenerating ? 'Generating...' : theme}
                </button>
            ))}
          </div>
      </div>
    </div>
  );
};

export default ColorPalette;
