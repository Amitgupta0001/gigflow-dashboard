import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-9xl font-black text-brand-600 select-none animate-pulse">
          404
        </h1>
        <div className="space-y-2">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Page Not Found</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            The page you are looking for does not exist, or you do not have permission to view it.
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate('/')}
            className="btn-primary py-2.5 px-6"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
export default NotFound;
