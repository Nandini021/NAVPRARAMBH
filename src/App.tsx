import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import './index.css';

import IntroAnimation from './components/IntroAnimation';
import Navigation from './components/Navigation';
import SiddhiAI from './components/SiddhiAI';

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const CareerExplorerPage = lazy(() => import('./pages/CareerExplorerPage'));
const JobsPage = lazy(() => import('./pages/JobsPage'));
const InternshipsPage = lazy(() => import('./pages/InternshipsPage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const CertificationsPage = lazy(() => import('./pages/CertificationsPage'));
const PlacementPrepPage = lazy(() => import('./pages/PlacementPrepPage'));
const KnowledgeGamesPage = lazy(() => import('./pages/KnowledgeGamesPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const StudentDashboardPage = lazy(() => import('./pages/StudentDashboardPage'));
const GovernmentOpportunitiesPage = lazy(() => import('./pages/GovernmentOpportunitiesPage'));
const PMInternshipMatchPage = lazy(() => import('./pages/PMInternshipMatchPage'));
const StudentFeaturePage = lazy(() => import('./pages/StudentFeaturePage'));

function ProtectedStudentFeature({ feature }: { feature: import('./pages/StudentFeaturePage').StudentFeature }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 32 }}>Loading your session…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <StudentFeaturePage feature={feature} />;
}

function ProtectedStudentDashboard() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 32 }}>Loading your session…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <StudentDashboardPage />;
}

function RouteLoading() {
  return <div role="status" aria-live="polite" style={{ minHeight: '50vh', display: 'grid', placeItems: 'center', padding: 32, color: '#0B1957' }}>Loading NAVPRARAMBH…</div>;
}

function MainApp() {
  const location = useLocation();
  const { loading } = useAuth();
  const [introDismissed, setIntroDismissed] = useState(false);
  // The opening book belongs to the public landing entry only. Waiting for
  // auth resolution prevents it from briefly covering an authenticated
  // dashboard during a refresh.
  const showIntro = !loading && location.pathname === '/' && !introDismissed && sessionStorage.getItem('np_intro') !== 'seen';

  const handleIntroComplete = () => setIntroDismissed(true);

  return (
    <>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/student-dashboard" element={<ProtectedStudentDashboard />} />
          <Route path="/dashboard" element={<ProtectedStudentDashboard />} />
          <Route path="/pm-internship-match" element={<PMInternshipMatchPage />} />
          <Route path="/student/match" element={<ProtectedStudentFeature feature="match" />} />
          <Route path="/student/learning" element={<ProtectedStudentFeature feature="learning" />} />
          <Route path="/student/resume" element={<ProtectedStudentFeature feature="resume" />} />
          <Route path="/student/roadmap" element={<ProtectedStudentFeature feature="roadmap" />} />
          <Route path="/student/achievements" element={<ProtectedStudentFeature feature="achievements" />} />
          <Route path="/*" element={
            <>
              <Navigation />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/careers" element={<CareerExplorerPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/government-opportunities" element={<GovernmentOpportunitiesPage />} />
                <Route path="/internships" element={<InternshipsPage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/certifications" element={<CertificationsPage />} />
                <Route path="/placement-prep" element={<PlacementPrepPage />} />
                <Route path="/games" element={<KnowledgeGamesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
              <SiddhiAI />
            </>
          } />
        </Routes>
      </Suspense>
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
