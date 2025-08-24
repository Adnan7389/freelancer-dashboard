import { Helmet } from 'react-helmet-async';

export const HelmetWrapper = ({ children }) => {
  return <Helmet>{children}</Helmet>;
};

export default HelmetWrapper;
