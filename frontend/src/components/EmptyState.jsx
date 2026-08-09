// components/EmptyState.jsx
// Friendly placeholder shown when a list has no data yet.

import React from 'react';

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4">
    {Icon && (
      <div className="h-14 w-14 rounded-2xl bg-primary-50 dark:bg-primary-950 text-primary-500 flex items-center justify-center mb-4">
        <Icon size={26} />
      </div>
    )}
    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
    {description && (
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
