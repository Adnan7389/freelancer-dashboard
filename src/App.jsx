import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth";
import Navbar from "./components/Navbar";
import LandingNavbar from "./components/LandingNavbar";
import Footer from "./components/Footer";
import MinimalFooter from "./components/MinimalFooter";
import ProtectedRoute from "./components/ProtectedRoute";
import { 
  Home, Login, Signup, Dashboard, SettingsPage, IncomeRecords, 
  PlatformTrendsPage, AboutPage, IncomeToolsPage, AnalyticsPage, 
  Legal, FAQPage, PricingPage, Success, Cancel, FeedbackPage, 
  AdminFeedbackPage, LoadingSpinner, SubscriptionPage, ForgotPasswordPage, ResetPasswordPage 
} from './lazy';
import FontOptimization from './components/FontOptimization';

// Default SEO configuration
const defaultSeo = {
  title: 'Freelancer Income Tracker Dashboard - Track & Grow Your Freelance Business',
  description: 'Powerful analytics and insights to help freelancers track, manage, and grow their income across multiple platforms. Get detailed reports and optimize your freelance business today!',
  keywords: 'freelance, income tracker, analytics, dashboard, freelancer tools, financial management, self-employed, gig economy',
  image: '/images/og-image.jpg',
  siteUrl: 'https://trackmyincome.vercel.app',
  twitter: '@freelancertracker'
};

function NavbarWrapper() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  
  return isLandingPage ? <LandingNavbar /> : <Navbar />;
}

function FooterWrapper() {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  // Show minimal footer for authenticated pages
  const isAuthenticatedPage = [
    '/dashboard',
    '/dashboard/settings',
    '/income-records',
    '/platform-trends',
    '/income-tools',
    '/analytics',
    '/legal',
    '/feedback',
    '/pricing'
  ].some(path => location.pathname.startsWith(path));
  
  // Don't show footer on auth-related pages
  if (['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname)) {
    return null;
  }
  
  return isAuthenticatedPage ? <MinimalFooter /> : <Footer />;
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="w-full min-h-screen bg-gray-100">
          {/* Global SEO Meta Tags */}
          <Helmet>
            <html lang="en" />
            <title>{defaultSeo.title}</title>
            <meta name="description" content={defaultSeo.description} />
            <meta name="keywords" content={defaultSeo.keywords} />
            <meta name="robots" content="index, follow" />
            <meta property="og:type" content="website" />
            <meta property="og:title" content={defaultSeo.title} />
            <meta property="og:description" content={defaultSeo.description} />
            <meta property="og:image" content={defaultSeo.image} />
            <meta property="og:url" content={defaultSeo.siteUrl} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={defaultSeo.title} />
            <meta name="twitter:description" content={defaultSeo.description} />
            <meta name="twitter:image" content={defaultSeo.image} />
            <meta name="twitter:creator" content={defaultSeo.twitter} />
            <link rel="canonical" href={defaultSeo.siteUrl} />
            
            {/* Preconnect to external domains */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="dns-prefetch" href="https://trackmyincome.vercel.app" />
            
            {/* Structured Data - Global SoftwareApplication */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Freelancer Income Tracker Dashboard",
                "operatingSystem": "Web, iOS, Android",
                "applicationCategory": "BusinessApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.8",
                  "ratingCount": "1247"
                },
                "description": "Track and analyze your freelance income across multiple platforms with powerful analytics and insights."
              })}
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
                    "item": defaultSeo.siteUrl
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Dashboard",
                    "item": `${defaultSeo.siteUrl}/dashboard`
                  }
                ]
              })}
            </script>
          </Helmet>
          
          <FontOptimization />
          <NavbarWrapper />
          <Toaster position="top-right" reverseOrder={false} />
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/legal" element={<Legal />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/success" element={<Success />} />
                  <Route path="/cancel" element={<Cancel />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route 
                    path="/admin/feedback" 
                    element={
                      <ProtectedRoute>
                        <AdminFeedbackPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/analytics" 
                    element={
                      <ProtectedRoute>
                        <AnalyticsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/settings"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/income-records" element={<ProtectedRoute><IncomeRecords /></ProtectedRoute>} />
                  <Route 
                    path="/platform-trends" 
                    element={
                      <ProtectedRoute>
                        <PlatformTrendsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/income-tools" 
                    element={
                      <ProtectedRoute>
                        <IncomeToolsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/subscription" 
                    element={
                      <ProtectedRoute>
                        <SubscriptionPage />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </Suspense>
            </main>
            <FooterWrapper />
          </div>
        </div>
        <Analytics />
        <SpeedInsights />
      </Router>
    </HelmetProvider>
  );
}

export default App;