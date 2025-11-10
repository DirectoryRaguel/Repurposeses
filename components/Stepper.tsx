
import React from 'react';

interface StepperProps {
  currentStep: number;
  setStep: (step: number) => void;
}

const steps = [
  "Brand Input",
  "Refine Branding Kit",
  "Website Elements",
  "Marketing Graphics",
  "Sample Outcomes",
  "Final Assets"
];

const Stepper: React.FC<StepperProps> = ({ currentStep, setStep }) => {
  return (
    <nav className="mb-8 pt-4" aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((stepName, stepIdx) => {
          const stepNumber = stepIdx + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <li key={stepName} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20 flex-1' : 'flex-shrink-0'}`}>
              <div className="flex flex-col items-center text-center">
                  {isCompleted ? (
                      <button
                        onClick={() => setStep(stepNumber)}
                        className="relative w-8 h-8 flex items-center justify-center bg-indigo-600 rounded-full hover:bg-indigo-900 transition-colors"
                      >
                        <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="sr-only">{stepName}</span>
                      </button>
                  ) : isCurrent ? (
                      <div className="relative w-8 h-8 flex items-center justify-center bg-white border-2 border-indigo-600 rounded-full" aria-current="step">
                        <span className="h-2.5 w-2.5 bg-indigo-600 rounded-full" aria-hidden="true" />
                        <span className="sr-only">{stepName}</span>
                      </div>
                  ) : (
                      <div className="group relative w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full">
                         <span className="sr-only">{stepName}</span>
                      </div>
                  )}
                   <p className={`mt-2 text-xs w-20 ${isCurrent ? 'font-semibold text-indigo-600' : 'text-gray-500'}`}>
                    {stepName}
                  </p>
              </div>
              {stepIdx < steps.length - 1 && (
                  <div className="absolute inset-0 top-3.5 left-auto right-0 w-full -translate-x-1/2" aria-hidden="true">
                    <div className={`h-0.5 w-full ${isCompleted ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                  </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Stepper;
