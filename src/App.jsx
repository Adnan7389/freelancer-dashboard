import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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
  AdminFeedbackPage, LoadingSpinner 
} from './lazy';
import FontOptimization from './components/FontOptimization';

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
    '/feedback'
  ].some(path => location.pathname.startsWith(path));
  
  // Don't show footer on login/signup pages
  if (['/login', '/signup'].includes(location.pathname)) {
    return null;
  }
  
  return isAuthenticatedPage ? <MinimalFooter /> : <Footer />;
}

function App() {
  return (
    <Router>
      <div className="w-full min-h-screen bg-gray-100">
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
            </Routes>
          </Suspense>
          </main>
          <FooterWrapper />
        </div>
      </div>
      <Analytics />
      <SpeedInsights />
    </Router>
  );
}

export default App;