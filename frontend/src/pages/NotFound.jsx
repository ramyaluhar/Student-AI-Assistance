// pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 text-center">
    <h1 className="text-6xl font-extrabold text-primary-600">404</h1>
    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mt-2">Page not found</p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
      The page you&apos;re looking for doesn&apos;t exist or has been moved.
    </p>
    <Link to="/" className="btn-primary mt-6">
      <FiArrowLeft size={15} /> Back to Home
    </Link>
  </div>
);

export default NotFound;
