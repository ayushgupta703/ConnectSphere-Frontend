import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  children, 
  ...props 
}, ref) => {
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] border border-primary-400/50',
    secondary: 'bg-white/10 text-gray-100 hover:bg-white/20 border border-white/5 backdrop-blur-md',
    outline: 'border border-white/10 bg-transparent hover:bg-white/5 text-gray-200',
    ghost: 'bg-transparent hover:bg-white/5 text-gray-300 hover:text-white',
    danger: 'bg-red-500/80 text-white hover:bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] border border-red-400/50',
  };

  const sizes = {
    sm: 'h-8 px-4 text-xs rounded-full',
    md: 'h-10 px-5 py-2 text-sm rounded-full',
    lg: 'h-12 px-8 text-base rounded-full',
    icon: 'h-10 w-10 p-2 rounded-full',
  };

  return (
    <button
      ref={ref}
      disabled={isLoading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
