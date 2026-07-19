import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ScanProvider } from '../context/ScanContext';
import ProtectedRoute from './ProtectedRoute';

// Pages
import AuthPage              from '../pages/auth/AuthPage';
import DashboardPage         from '../pages/dashboard/DashboardPage';
import NewScanPage           from '../pages/scans/NewScanPage';
import ScanProgressPage      from '../pages/scans/ScanProgressPage';
import ReportsPage           from '../pages/reports/ReportsPage';
import ReportDetailPage      from '../pages/reports/ReportDetailPage';
import VulnerabilitiesPage   from '../pages/vulnerabilities/VulnerabilitiesPage';
import SettingsPage          from '../pages/settings/SettingsPage';

const AppRouter = () => (
  <BrowserRouter>
    <AuthProvider>
      <ScanProvider>
        <Routes>
          {/* Public */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected — wrapped in AppLayout via ProtectedRoute */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"              element={<DashboardPage />} />
            <Route path="/scans/new"              element={<NewScanPage />} />
            <Route path="/scans/progress"         element={<ScanProgressPage />} />
            <Route path="/reports"                element={<ReportsPage />} />
            <Route path="/reports/:id"            element={<ReportDetailPage />} />
            <Route path="/vulnerabilities"        element={<VulnerabilitiesPage />} />
            <Route path="/settings"               element={<SettingsPage />} />
          </Route>

          {/* Redirects */}
          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*"  element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ScanProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default AppRouter;
