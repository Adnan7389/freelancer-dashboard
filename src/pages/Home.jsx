import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiBarChart2, FiDollarSign, FiFileText, FiTrendingUp, FiArrowRight } from 'react-icons/fi';

const features = [
  {
    icon: <FiDollarSign className="w-8 h-8 text-blue-600" />,
    title: 'Income Tracking',
    description: 'Easily record and monitor your freelance income from multiple platforms in one place.',
  },
  {
    icon: <FiBarChart2 className="w-8 h-8 text-blue-600" />,
    title: 'Financial Analytics',
    description: 'View detailed analytics of your earnings with interactive charts and reports.',
  },
  {
    icon: <FiTrendingUp className="w-8 h-8 text-blue-600" />,
    title: 'Platform Insights',
    description: 'Track performance across different freelancing platforms and identify your most profitable ones.',
  },
  {
    icon: <FiFileText className="w-8 h-8 text-blue-600" />,
    title: 'Income Records',
    description: 'Maintain a complete history of all your income transactions with detailed records.',
  },
];

function Home() {
  const pageTitle = 'Freelancer Income Tracker Dashboard - Track & Grow Your Income';
  const pageDescription = 'Powerful analytics and insights to help you track, manage, and grow your freelancing career. Get started with a 14-day free trial, no credit card required.';
  const pageUrl = 'https://trackmyincome.vercel.app';
  const pageImage = 'https://trackmyincome.vercel.app/images/og-home.jpg';
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="freelance income tracker, freelancer dashboard, financial management, income analytics, self-employed tools, gig economy" />
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
        
        {/* Structured Data for Homepage */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": pageTitle,
            "description": pageDescription,
            "url": pageUrl,
            "publisher": {
              "@type": "Organization",
              "name": "Freelancer Tracker",
              "logo": {
                "@type": "ImageObject",
                "url": "https://trackmyincome.vercel.app/logo.png"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": pageUrl
            }
          })}
        </script>
      </Helmet>
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight max-w-4xl mx-auto">
            Take Control of Your <span className="text-blue-600">Freelance Income</span> with Powerful Analytics
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful analytics and insights to help you track, manage, and grow your freelancing career all in one place.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/signup" 
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors shadow-lg hover:shadow-xl"
            >
              Start Free Trial
              <FiArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              to="/demo" 
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-blue-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors"
            >
              Watch Demo
            </Link>
          </div>
          <div className="mt-8 text-sm text-gray-500">
            No credit card required • 14-day free trial • Cancel anytime
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-white py-16 sm:py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Freelance Income Management Made Simple
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
              Powerful features designed to help you manage and grow your freelance business.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="pt-8 pb-10 px-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to take your freelance business to the next level?
          </h2>
          <p className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto">
            Join thousands of freelancers who use our platform to track their success and grow their business.
          </p>
          <div className="mt-8">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-blue-700 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10 transition-colors shadow-lg hover:shadow-xl"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

      {/* About Section - Just before footer */}
      <section id="about" className="bg-gray-50 py-16 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            About This Project
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
            A passion project built to help freelancers track, analyze, and grow their business.
            Focus on your work while we handle the numbers.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Home;