import React, { useState } from 'react';

interface LogoIdeasProps {
  ideas: string[];
  onRegenerate: (feedback: string) => void;
  onAddTask: (idea: string) => void;
  isRegenerating: boolean;
}

const LogoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);


const LogoIdeas: React.FC<LogoIdeasProps> = ({ ideas, onRegenerate, onAddTask, isRegenerating }) => {
  const [feedback, setFeedback] = useState('');

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Logo Ideas</h3>
      <div className="space-y-4">
        {ideas.map((idea, index) => (
          <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex-shrink-0 mr-4">
                <LogoIcon />
            </div>
            <div className="flex-grow">
              <p className="text-gray-600">{idea}</p>
            </div>
            <button 
              onClick={() => onAddTask(idea)}
              className="ml-4 flex-shrink-0 bg-indigo-100 text-indigo-700 text-xs font-bold py-1 px-3 rounded-full hover:bg-indigo-200 transition-colors"
              title="Add to Design Task List"
            >
              + Task
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-700">Not quite right?</h4>
          <p className="text-gray-500 text-sm mt-1 mb-3">Provide feedback to generate new logo ideas.</p>
          <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g., 'I like the second idea, but can we make it more playful?' or 'Looking for something more abstract and geometric...'"
              className="w-full h-24 p-3 bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 resize-y"
              disabled={isRegenerating}
          />
          <button
              onClick={() => onRegenerate(feedback)}
              disabled={isRegenerating}
              className="mt-3 w-full sm:w-auto bg-gray-700 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
            >
              {isRegenerating ? 'Regenerating...' : 'Regenerate Logos'}
            </button>
      </div>
    </div>
  );
};

export default LogoIdeas;
