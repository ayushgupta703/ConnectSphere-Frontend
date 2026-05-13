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
      className={`${selectedSize} rounded-full overflow-hidden flex items-center justify-center font-bold text-white bg-dark-800 border border-white/10 bg-gradient-to-tr from-primary-600 to-primary-800 shadow-lg flex-shrink-0 transition-transform duration-300 hover:scale-105 hover:ring-2 hover:ring-primary-500/50 ${className}`}
    >
      {src ? (
        <AuthenticatedImage 
          url={src} 
          alt={name} 
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" 
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
