import React from 'react';

const Skeleton = ({ className, variant = 'rect' }) => {
  const baseClasses = "shimmer bg-white/[0.05]";
  
  const variantClasses = {
    rect: "rounded-lg",
    circle: "rounded-full",
    text: "rounded h-3 w-full",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
};

export default Skeleton;
