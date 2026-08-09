// components/StatCard.jsx
// Small reusable metric card used across Dashboard and Admin Panel.

import React from 'react';

const colorMap = {
  indigo: 'from-indigo-500 to-indigo-700',
  green: 'from-emerald-500 to-emerald-700',
  orange: 'from-orange-500 to-orange-700',
  pink: 'from-pink-500 to-pink-700',
  blue: 'from-blue-500 to-blue-700',
  red: 'from-red-500 to-red-700',
};

const StatCard = ({ icon: Icon, label, value, color = 'indigo', suffix = '' }) => {
  return (
    <div className="card flex items-center gap-4 hover:shadow-md transition-shadow">
      <div
        className={`h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-white`}
      >
        {Icon && <Icon size={20} />}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {value}
          {suffix}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
