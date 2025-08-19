import { lazy } from 'react';

// Lazy-loaded pages
export const Home = lazy(() => import('./pages/Home'));
export const Login = lazy(() => import('./pages/LoginPage'));
export const Signup = lazy(() => import('./pages/SignupPage'));
export const Dashboard = lazy(() => import('./pages/Dashboard'));
export const SettingsPage = lazy(() => import('./pages/SettingsPage'));
export const IncomeRecords = lazy(() => import('./pages/IncomeRecords'));
export const PlatformTrendsPage = lazy(() => import('./pages/PlatformTrendsPage'));
export const AboutPage = lazy(() => import('./pages/AboutPage'));
export const IncomeToolsPage = lazy(() => import('./pages/IncomeToolsPage'));
export const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
export const Legal = lazy(() => import('./pages/Legal'));
export const FAQPage = lazy(() => import('./pages/FAQPage'));
export const PricingPage = lazy(() => import('./pages/PricingPage'));
export const Success = lazy(() => import('./pages/Success'));
export const Cancel = lazy(() => import('./pages/Cancel'));
export const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
export const AdminFeedbackPage = lazy(() => import('./pages/AdminFeedbackPage'));
export const SubscriptionPage = lazy(() => import('./pages/Subscription/SubscriptionPage'));

// Loading component
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);
