import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

const ImageLoader: React.FC<ImageLoaderProps> = ({
  src,
  alt,
  className = '',
  priority = false,
  width,
  height,
  objectFit = 'cover',
  onLoad,
  onError,
  fallbackSrc = 'https://via.placeholder.com/400?text=Image+Not+Found',
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  // Fallback to placeholder if src is not available
  useEffect(() => {
    if (!src) {
      setHasError(true);
      setIsLoading(false);
    } else {
      setImageSrc(src);
      setHasError(false);
      setIsLoading(true);
    }
  }, [src]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleImageError = () => {
    console.error(`Failed to load image: ${imageSrc}`);
    setIsLoading(false);
    setHasError(true);
    
    // Try fallback image
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setIsLoading(true);
    } else {
      onError?.();
    }
  };

  return (
    <div className={`relative bg-gray-200 overflow-hidden ${className}`}>
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}

      {/* Image */}
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          objectFit: objectFit,
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={priority ? 'eager' : 'lazy'}
      />

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">Image failed to load</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageLoader;
