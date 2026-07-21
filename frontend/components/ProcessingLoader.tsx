import React from 'react';

interface ProcessingStep {
  id: string;
  label: string;
  completed: boolean;
}

interface ProcessingLoaderProps {
  isVisible: boolean;
  currentStatus?: string;
  steps?: ProcessingStep[];
}

/**
 * A clean, brand-consistent buffering overlay shown while the design is being
 * processed and added to the cart. Replaces the old blue progress bar / step list
 * with a subtle animated logo for a smoother experience.
 */
const ProcessingLoader: React.FC<ProcessingLoaderProps> = ({
  isVisible,
  currentStatus,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      {/* Animated brand logo with spinning ring */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-24 h-24 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" />
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
          <svg
            className="w-8 h-8 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7v10c0 5.55 3.84 10 9 9s9-4.65 9-9V7l-8-5z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 11l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Status text */}
      <p className="mt-6 text-gray-700 font-medium">
        {currentStatus || 'Processing your design…'}
      </p>

      {/* Subtle buffering dots */}
      <div className="mt-3 flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '-0.3s' }} />
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '-0.15s' }} />
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" />
      </div>
    </div>
  );
};

export default ProcessingLoader;
