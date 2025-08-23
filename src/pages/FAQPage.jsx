import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const FAQPage = () => {
  const pageTitle = 'Frequently Asked Questions - Freelancer Income Tracker';
  const pageDescription = 'Find answers to common questions about Freelancer Income Tracker. Learn about features, pricing, security, and more to make the most of our platform.';
  const pageUrl = 'https://trackmyincome.vercel.app/';
  const pageImage = 'https://trackmyincome.vercel.app/images/og-faq.jpg';
  const faqs = [
    {
      question: 'What is Freelancer Analytics?',
      answer: 'Freelancer Analytics is a dashboard that helps freelancers track their projects, income, and productivity in one place.'
    },
    {
      question: 'How do I get started?',
      answer: 'Simply sign up for an account, connect your freelance platforms, and start tracking your projects and income.'
    },
    {
      question: 'Which platforms do you support?',
      answer: 'We currently support major freelance platforms including Upwork, Fiverr, and Freelancer.com. More platforms will be added soon.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we take data security seriously. All your data is encrypted and we follow industry best practices to keep your information safe.'
    },
    {
      question: 'How much does it cost?',
      answer: 'We offer a free tier with basic features. Check our pricing page for premium plans with advanced features.'
    },
    {
      question: 'Can I export my data?',
      answer: 'Yes, you can export your data in various formats including CSV and PDF from the dashboard.'
    }
  ];

  // Prepare FAQ schema data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="freelancer faq, income tracker help, freelance tools questions, support, how to use" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={pageImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageImage} />
        <link rel="canonical" href={pageUrl} />
        
        {/* FAQPage Schema */}
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
        
        {/* BreadcrumbList Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://trackmyincome.vercel.app"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "FAQ",
                "item": pageUrl
              }
            ]
          })}
        </script>
      </Helmet>
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Freelancer Income Tracker - Frequently Asked Questions
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Find answers to common questions about Freelancer Analytics.
          </p>
        </div>

        <div className="mt-16">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-12">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <dt className="text-lg font-medium text-gray-900">
                  {faq.question}
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Still Have Questions About Freelancer Income Tracker?</h2>
          <p className="mt-4 text-base text-gray-500">
            Can't find the answer you're looking for? Please reach out to our support team.
          </p>
          <div className="mt-6">
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
