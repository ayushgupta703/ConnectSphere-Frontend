import React from 'react';
import { cn } from './Button';

export const Input = React.forwardRef(({ 
  className, 
  error,
  label,
  id,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1 ml-1">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-xl border border-white/10 bg-dark-900/50 px-4 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-dark-800 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-inner",
          error && "border-red-500/50 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
