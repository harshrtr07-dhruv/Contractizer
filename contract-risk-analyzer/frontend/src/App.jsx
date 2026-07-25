import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import DashboardPage  from './pages/DashboardPage';
import ResultsPage    from './pages/ResultsPage';
import AnalyticsPage  from './pages/AnalyticsPage';
import LandingPage    from './pages/LandingPage';
import PlatformPage   from './pages/PlatformPage';
import HowItWorksPage from './pages/HowItWorksPage';
import SecurityPage   from './pages/SecurityPage';
import PrivacyPage    from './pages/PrivacyPage';
import TermsPage      from './pages/TermsPage';
import StatusPage     from './pages/StatusPage';

import OnboardingPage from './pages/OnboardingPage';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '451396933713-rl5m2momr19abvjd21rij093siernt3u.apps.googleusercontent.com';

const ProtectedRoute = ({ children, requireOnboarded = true }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If the route requires onboarding and user is not onboarded, redirect to onboarding
  if (requireOnboarded && user && !user.onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  // If the route is specifically for onboarding (requireOnboarded=false) and user IS onboarded, redirect to dashboard
  if (!requireOnboarded && user && user.onboarded) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <ScrollToTop />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/"             element={<LandingPage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/platform"     element={<PlatformPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/security"     element={<SecurityPage />} />
          <Route path="/privacy"      element={<PrivacyPage />} />
          <Route path="/terms"        element={<TermsPage />} />
          <Route path="/status"       element={<StatusPage />} />

          {/* Protected */}
          <Route path="/onboarding" element={<ProtectedRoute requireOnboarded={false}><OnboardingPage /></ProtectedRoute>} />
          <Route path="/dashboard"  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/analytics"  element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/results/:contractId" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
