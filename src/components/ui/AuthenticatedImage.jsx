import React, { useState, useEffect } from 'react';
import { mediaService } from '../../services/mediaService';
import Skeleton from './Skeleton';

const AuthenticatedImage = ({ url, className, title, alt = "Post attachment" }) => {
  const [src, setSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!url) return;
    
    let isMounted = true;
    setSrc(null); 
    setIsLoaded(false);

    mediaService.fetchMediaBlob(url, token).then(blobUrl => {
      if (isMounted) setSrc(blobUrl);
    }).catch(() => {
      if (isMounted) setSrc(url); 
    });

    return () => {
      isMounted = false;
    };
  }, [url, token]);

  if (!src) return <Skeleton className={className} />;
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        title={title}
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-xl'}`}
        loading="lazy"
        onError={(e) => {
          if (e.target.getAttribute('data-error')) return;
          e.target.setAttribute('data-error', 'true');
          e.target.src = "https://via.placeholder.com/600x400?text=Image+Load+Error";
        }}
      />
      {!isLoaded && <Skeleton className="absolute inset-0 z-10" />}
    </div>
  );
};

export default AuthenticatedImage;
