import React, { useEffect, useState } from 'react';
import '../styles/LoadingSpinner.module.css';

const LoadingSpinner: React.FC = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Register the function to set loading state globally
    window.setLoadingSpinner = setLoading;
    return () => {
      // Cleanup the function from the window object
      delete window.setLoadingSpinner;
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="spinner-container">
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner;
