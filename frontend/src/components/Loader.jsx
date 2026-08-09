// components/Loader.jsx
// Reusable loading spinner. `full` renders a full-page centered version.

import React from 'react';

const Loader = ({ full = false, size = 'md', label }) => {
  const sizeClasses = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-[3px]' };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-primary-600 border-t-transparent`}
      />
      {label && <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>}
    </div>
  );

  if (full) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">{spinner}</div>
    );
  }

  return spinner;
};

export default Loader;
