import { Helmet } from 'react-helmet';
import { useEffect } from 'react';

export const HelmetWrapper = ({ children }) => {
  // This effect ensures Helmet works with React 19's concurrent rendering
  useEffect(() => {
    // Force a re-render to ensure Helmet updates are applied
    const timeout = setTimeout(() => {
      // This forces React to re-render the Helmet component
      window.dispatchEvent(new Event('resize'));
    }, 0);
    
    return () => clearTimeout(timeout);
  }, [children]);

  return <Helmet>{children}</Helmet>;
};

export default HelmetWrapper;
