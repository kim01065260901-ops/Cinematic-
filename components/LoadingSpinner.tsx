
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', label }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={`${sizeClasses[size]} border-t-2 border-amber-500 border-solid rounded-full animate-spin`}></div>
      {label && <p className="text-sm text-gray-400 font-medium">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;
