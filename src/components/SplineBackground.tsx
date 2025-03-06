import { useEffect, useState } from 'react';
import Spline from '@splinetool/react-spline';

interface SplineBackgroundProps {
  url: string;
}

const SplineBackground = ({ url }: SplineBackgroundProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Add a timeout to show loading state for at least 1 second
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Add a timeout to detect if loading takes too long
    const errorTimer = setTimeout(() => {
      if (isLoading) {
        setHasError(true);
        setIsLoading(false);
      }
    }, 15000); // 15 seconds timeout

    return () => {
      clearTimeout(timer);
      clearTimeout(errorTimer);
    };
  }, [isLoading]);

  const handleError = () => {
    console.error("Failed to load Spline scene");
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-indigo-900">
          <div className="text-white text-xl">Loading 3D Experience...</div>
        </div>
      )}
      
      {hasError ? (
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 to-indigo-700">
          {/* Fallback gradient background */}
        </div>
      ) : (
        <Spline 
          scene={url} 
          onLoad={() => setIsLoading(false)}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default SplineBackground;