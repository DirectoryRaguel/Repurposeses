import React from 'react';
import type { Typography } from '../types';
import EditableField from './EditableField';

interface TypographyScaleProps {
  typography: Typography;
  onUpdateTypography: (newTypography: Typography) => void;
}

const TypographyScale: React.FC<TypographyScaleProps> = ({ typography, onUpdateTypography }) => {
  const { heading, body } = typography;

  const handleHeadingFontChange = (newValue: string) => {
      onUpdateTypography({ ...typography, heading: { ...typography.heading, fontFamily: newValue }});
  }
  const handleHeadingWeightChange = (newValue: string) => {
      onUpdateTypography({ ...typography, heading: { ...typography.heading, fontWeight: newValue }});
  }
  const handleBodyFontChange = (newValue: string) => {
      onUpdateTypography({ ...typography, body: { ...typography.body, fontFamily: newValue }});
  }
  const handleBodyWeightChange = (newValue: string) => {
      onUpdateTypography({ ...typography, body: { ...typography.body, fontWeight: newValue }});
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Typography</h3>
       <p className="text-xs text-gray-400 -mt-4 mb-4 text-center">Click a font name or weight to edit it.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Heading</p>
          <EditableField
            value={heading.fontFamily}
            onUpdate={handleHeadingFontChange}
            className="text-lg font-bold text-indigo-600 cursor-pointer hover:bg-gray-100 rounded -m-1 p-1"
            inputClassName="text-lg font-bold text-indigo-600 bg-indigo-50 rounded -m-1 p-1 outline-none focus:ring-2 ring-indigo-400"
          />
          <div className="flex items-center">
              <span className="text-gray-500 mr-2">Weight:</span>
              <EditableField
                value={heading.fontWeight}
                onUpdate={handleHeadingWeightChange}
                className="text-lg font-bold text-indigo-600 cursor-pointer hover:bg-gray-100 rounded -m-1 p-1"
                inputClassName="text-lg font-bold text-indigo-600 bg-indigo-50 rounded -m-1 p-1 outline-none focus:ring-2 ring-indigo-400"
              />
          </div>
          <h1 
            className="mt-4 text-4xl truncate" 
            style={{ fontFamily: `'${heading.fontFamily}', sans-serif`, fontWeight: heading.fontWeight }}
          >
            Aa - The quick brown fox
          </h1>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Body</p>
           <EditableField
            value={body.fontFamily}
            onUpdate={handleBodyFontChange}
            className="text-lg font-bold text-indigo-600 cursor-pointer hover:bg-gray-100 rounded -m-1 p-1"
            inputClassName="text-lg font-bold text-indigo-600 bg-indigo-50 rounded -m-1 p-1 outline-none focus:ring-2 ring-indigo-400"
           />
           <div className="flex items-center">
              <span className="text-gray-500 mr-2">Weight:</span>
              <EditableField
                value={body.fontWeight}
                onUpdate={handleBodyWeightChange}
                className="text-lg font-bold text-indigo-600 cursor-pointer hover:bg-gray-100 rounded -m-1 p-1"
                inputClassName="text-lg font-bold text-indigo-600 bg-indigo-50 rounded -m-1 p-1 outline-none focus:ring-2 ring-indigo-400"
              />
           </div>
          <p 
            className="mt-4 text-base text-gray-700"
            style={{ fontFamily: `'${body.fontFamily}', sans-serif`, fontWeight: body.fontWeight, lineHeight: 1.6 }}
          >
            The quick brown fox jumps over the lazy dog. This is some sample body text to demonstrate the selected font. It's designed to be legible and pleasant to read for longer passages of content on your website.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TypographyScale;