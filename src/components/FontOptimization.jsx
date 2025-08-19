import { useEffect } from 'react';

export default function FontOptimization() {
  useEffect(() => {
    // Preconnect to Google Fonts
    const preconnectGoogle = document.createElement('link');
    preconnectGoogle.rel = 'preconnect';
    preconnectGoogle.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnectGoogle);

    const preconnectGstatic = document.createElement('link');
    preconnectGstatic.rel = 'preconnect';
    preconnectGstatic.href = 'https://fonts.gstatic.com';
    preconnectGstatic.crossOrigin = 'anonymous';
    document.head.appendChild(preconnectGstatic);

    // Load Inter font from Google Fonts
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    return () => {
      document.head.contains(preconnectGoogle) && document.head.removeChild(preconnectGoogle);
      document.head.contains(preconnectGstatic) && document.head.removeChild(preconnectGstatic);
      document.head.contains(fontLink) && document.head.removeChild(fontLink);
    };
  }, []);

  return null;
}
