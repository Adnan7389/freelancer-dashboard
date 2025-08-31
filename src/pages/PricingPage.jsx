import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import HelmetWrapper from '../components/HelmetWrapper';
import { useTheme } from '../hooks/useTheme';

const PricingPage = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  
  const pageTitle = 'Freelancer Income Tracker Pricing - Simple & Transparent Plans';
  const pageDescription = 'Choose the perfect plan for your freelance business. Start with our free plan or unlock advanced features with Pro. No hidden fees, cancel anytime.';
  const pageUrl = 'https://trackmyincome.vercel.app/pricing';
  const pageImage = 'https://trackmyincome.vercel.app/images/og-pricing.jpg';
  
  const features = [
    { name: 'Income Records', basic: '50 max', pro: 'Unlimited' },
    { name: 'Platform Tracking', basic: 'Basic', pro: 'Advanced' },
    { name: 'Data Export', basic: false, pro: 'CSV' },
    { name: 'Analytics', basic: 'Basic', pro: 'Advanced' },
    { name: 'Priority Support', basic: false, pro: true }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-12 px-4`}>
      <HelmetWrapper>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="freelancer pricing, income tracker cost, freelance tools pricing, business expense, budget planning" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={pageImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageImage} />
        <link rel="canonical" href={pageUrl} />
        
        {/* Structured Data for Pricing Page */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Freelancer Income Tracker",
            "description": pageDescription,
            "brand": {
              "@type": "Brand",
              "name": "Freelancer Tracker"
            },
            "offers": [
              {
                "@type": "Offer",
                "name": "Basic Plan",
                "price": "0",
                "priceCurrency": "USD",
                "priceSpecification": {
                  "@type": "PriceSpecification",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "description": "Perfect for getting started with basic income tracking"
              },
              {
                "@type": "Offer",
                "name": "Pro Plan",
                "price": "5",
                "priceCurrency": "USD",
                "priceSpecification": {
                  "@type": "PriceSpecification",
                  "price": "5",
                  "priceCurrency": "USD",
                  "billingIncrement": 1,
                  "billingDuration": "P1M"
                },
                "description": "Advanced features for serious freelancers"
              }
            ]
          })}
        </script>
      </HelmetWrapper>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Simple, Transparent Pricing for Freelancers</h1>
          <p className={`mt-3 text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Choose the perfect plan that fits your freelance business needs. No hidden fees, cancel anytime.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className={`rounded-xl shadow-md p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Basic</h2>
            <p className={`mt-2 text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Free</p>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-6`}>Perfect for getting started</p>
            
            <ul className="space-y-3 mb-8">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <FiCheck className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className={!feature.basic ? (theme === 'dark' ? 'text-gray-500' : 'text-gray-400') : (theme === 'dark' ? 'text-gray-300' : 'text-gray-700')}>
                    {feature.name}: {feature.basic || '—'}
                  </span>
                </li>
              ))}
            </ul>
            
            {currentUser ? (
              <Link 
                to="/dashboard" 
                className={`block w-full text-center py-3 rounded-lg font-medium ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                } transition-colors`}
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link 
                to="/signup" 
                className={`block w-full text-center py-3 rounded-lg font-medium ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                } transition-colors`}
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Pro Plan */}
          <div className={`relative rounded-xl shadow-xl border-2 border-blue-500 overflow-hidden ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              POPULAR
            </div>
            <div className="p-8">
              <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Pro</h2>
              <p className={`mt-2 text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                $5<span className={`text-lg font-normal ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>/month</span>
              </p>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-6`}>For serious freelancers</p>
              
              <ul className="space-y-3 mb-8">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <FiCheck className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className={!feature.pro ? (theme === 'dark' ? 'text-gray-500' : 'text-gray-400') : (theme === 'dark' ? 'text-gray-300' : 'text-gray-700')}>
                      {feature.name}: {feature.pro === true ? '✓' : feature.pro || '—'}
                    </span>
                  </li>
                ))}
              </ul>
              
              {currentUser ? (
                <Link to="/dashboard/upgrade" className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-medium transition-colors">
                  Upgrade Now
                </Link>
              ) : (
                <Link to="/signup?plan=pro" className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-medium transition-colors">
                  Start Free Trial
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* <div className={`mt-12 text-center text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <p>Need help choosing? <Link to="/contact" className="text-blue-600 hover:underline">Contact us</Link></p>
        </div> */}
      </div>
    </div>
  );
};

export default PricingPage;