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
          "flex h-12 w-full rounded-[1.25rem] border border-white/[0.08] bg-white/[0.03] px-5 py-2 text-sm text-gray-100 placeholder:text-gray-500 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 focus:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]",
          error && "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50",
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
