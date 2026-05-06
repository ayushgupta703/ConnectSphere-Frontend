import AuthenticatedImage from './AuthenticatedImage';

/**
 * Avatar component that displays a user's profile picture or their initial.
 * 
 * @param {string} src - The URL of the profile picture.
 * @param {string} name - The user's name or username to get the initial from.
 * @param {string} size - The size of the avatar ('sm', 'md', 'lg', 'xl').
 * @param {string} className - Additional CSS classes.
 */
const Avatar = ({ src, name, size = "md", className = "" }) => {
  const initials = (name?.[0] || 'U').toUpperCase();
  
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-lg",
    xl: "h-24 w-24 text-3xl",
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div 
      className={`${selectedSize} rounded-full overflow-hidden flex items-center justify-center font-bold text-white bg-[#16a34a] bg-gradient-to-tr from-[#22c55e] to-[#15803d] shadow-sm flex-shrink-0 ${className}`}
    >
      {src ? (
        <AuthenticatedImage 
          url={src} 
          alt={name} 
          className="h-full w-full object-cover" 
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
