import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'blue' | 'yellow' | 'slate' | 'indigo';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'blue',
}) => {
  const variants = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30',
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 border-yellow-100 dark:border-yellow-900/30',
    slate: 'bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-500 border-slate-100 dark:border-slate-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800',
  };

  return (
    <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${variants[variant]}`}>
      {children}
    </span>
  );
};
