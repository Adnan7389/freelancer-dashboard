import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const PricingPage = () => {
  const { currentUser } = useAuth();
  
  const features = [
    { name: 'Income Records', basic: '50 max', pro: 'Unlimited' },
    { name: 'Platform Tracking', basic: 'Basic', pro: 'Advanced' },
    { name: 'Data Export', basic: false, pro: 'CSV' },
    { name: 'Analytics', basic: 'Basic', pro: 'Advanced' },
    { name: 'Priority Support', basic: false, pro: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Simple, transparent pricing</h1>
          <p className="mt-3 text-xl text-gray-500">Choose the perfect plan for your needs.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-semibold">Basic</h2>
            <p className="mt-2 text-4xl font-bold">Free</p>
            <p className="text-gray-500 mb-6">Perfect for getting started</p>
            
            <ul className="space-y-3 mb-8">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <FiCheck className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className={!feature.basic ? 'text-gray-400' : ''}>
                    {feature.name}: {feature.basic || '—'}
                  </span>
                </li>
              ))}
            </ul>
            
            {currentUser ? (
              <Link to="/dashboard" className="block w-full bg-gray-100 text-gray-800 text-center py-3 rounded-lg font-medium">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/signup" className="block w-full bg-gray-100 text-gray-800 text-center py-3 rounded-lg font-medium">
                Get Started
              </Link>
            )}
          </div>

          {/* Pro Plan */}
          <div className="relative bg-white rounded-xl shadow-xl border-2 border-blue-500 overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              POPULAR
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-semibold">Pro</h2>
              <p className="mt-2 text-4xl font-bold">$5<span className="text-lg font-normal text-gray-500">/month</span></p>
              <p className="text-gray-500 mb-6">For serious freelancers</p>
              
              <ul className="space-y-3 mb-8">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <FiCheck className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className={!feature.pro ? 'text-gray-400' : ''}>
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
        
        {/* <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Need help choosing? <Link to="/contact" className="text-blue-600 hover:underline">Contact us</Link></p>
        </div> */}
      </div>
    </div>
  );
};

export default PricingPage;
