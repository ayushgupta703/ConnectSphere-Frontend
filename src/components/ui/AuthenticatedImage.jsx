import React, { useState, useEffect } from 'react';
import { mediaService } from '../../services/mediaService';

/**
 * Image component that fetches media using mediaService.
 */
const AuthenticatedImage = ({ url, className, title, alt = "Post attachment" }) => {
  const [src, setSrc] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!url) return;
    
    let isMounted = true;

    mediaService.fetchMediaBlob(url, token).then(blobUrl => {
      if (isMounted) setSrc(blobUrl);
    }).catch(() => {
      // In case of any unexpected throw from service
      if (isMounted) setSrc(url); 
    });

    return () => {
      isMounted = false;
    };
  }, [url, token]);

  if (!src) return <div className={`bg-gray-100 animate-pulse ${className}`} />;
  
  return (
    <img
      src={src}
      alt={alt}
      title={title}
      className={className}
      loading="lazy"
      onError={(e) => {
        if (e.target.getAttribute('data-error')) return;
        e.target.setAttribute('data-error', 'true');
        e.target.src = "https://via.placeholder.com/600x400?text=Image+Load+Error";
      }}
    />
  );
};

export default AuthenticatedImage;
