import React from 'react';

/**
 * Spinner de chargement réutilisable
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} className - classes supplémentaires
 */
function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' };
  return (
    <div className={`${sizes[size]} border-gray-200 border-t-slate-700 rounded-full animate-spin ${className}`} />
  );
}

export default LoadingSpinner;
