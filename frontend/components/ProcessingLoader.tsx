import React from 'react';
import { FaSpinner, FaCheckCircle } from 'react-icons/fa';

interface ProcessingStep {
  id: string;
  label: string;
  completed: boolean;
}

interface ProcessingLoaderProps {
  isVisible: boolean;
  currentStatus: string;
  steps: ProcessingStep[];
}

const ProcessingLoader: React.FC<ProcessingLoaderProps> = ({
  isVisible,
  currentStatus,
  steps
}) => {
  if (!isVisible) return null;

  const currentStepIndex = steps.findIndex(step => !step.completed);
  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercent = (completedSteps / steps.length) * 100;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 shadow-2xl z-50 animate-slide-up">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FaSpinner className="w-6 h-6 animate-spin text-white" />
            <div>
              <h3 className="font-semibold text-lg">Processing Your Design</h3>
              <p className="text-blue-100 text-sm">{currentStatus}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{Math.round(progressPercent)}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-blue-400 rounded-full h-2 mb-4 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 p-3 rounded-lg transition-all ${
                step.completed
                  ? 'bg-blue-400 bg-opacity-50'
                  : index === currentStepIndex
                  ? 'bg-white bg-opacity-20 border border-white border-opacity-40'
                  : 'bg-blue-400 bg-opacity-30'
              }`}
            >
              <div className="flex-shrink-0 w-5 h-5">
                {step.completed ? (
                  <FaCheckCircle className="w-5 h-5 text-white" />
                ) : index === currentStepIndex ? (
                  <FaSpinner className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-opacity-30" />
                )}
              </div>
              <span className="text-sm font-medium truncate">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProcessingLoader;
