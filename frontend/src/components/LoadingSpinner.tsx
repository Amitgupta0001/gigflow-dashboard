import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  fullPage = false 
}) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-800"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-brand-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm transition-colors">
        {spinner}
      </div>
    );
  }

  return <div className="py-12 flex justify-center">{spinner}</div>;
};
export default LoadingSpinner;
