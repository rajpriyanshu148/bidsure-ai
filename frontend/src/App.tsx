import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TendersPage } from './pages/TendersPage';
import { NewTenderPage } from './pages/NewTenderPage';
import { TenderDetailPage } from './pages/TenderDetailPage';
import { BidderDetailPage } from './pages/BidderDetailPage';
import { GovernmentVerificationPage } from './pages/GovernmentVerificationPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { LoginPage } from './pages/LoginPage';
import { BiddingPortalPage } from './pages/BiddingPortalPage';

const ProtectedLayout: React.FC = () => {
  const token = localStorage.getItem('bidsure_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tenders" element={<TendersPage />} />
            <Route path="/tenders/new" element={<NewTenderPage />} />
            <Route path="/tenders/:id" element={<TenderDetailPage />} />
            <Route path="/bidders/:id" element={<BidderDetailPage />} />
            <Route path="/bidders/:id/compliance" element={<BidderDetailPage />} />
            <Route path="/bidders/:id/documents" element={<BidderDetailPage />} />
            <Route path="/bidders/:id/evidence" element={<BidderDetailPage />} />
            <Route path="/bidders/:id/audit" element={<BidderDetailPage />} />
            <Route path="/government-verification" element={<GovernmentVerificationPage />} />
            <Route path="/audit" element={<AuditTrailPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/bidding" element={<BiddingPortalPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};
