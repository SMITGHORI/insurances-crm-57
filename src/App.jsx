import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage';
import AgentsPage from './pages/AgentsPage';
import PoliciesPage from './pages/PoliciesPage';
import ClaimsPage from './pages/ClaimsPage';
import LeadsPage from './pages/LeadsPage';
import QuotationsPage from './pages/QuotationsPage';
import InvoicesPage from './pages/InvoicesPage';
import Settings from './pages/Settings';
import RecentActivities from './pages/RecentActivities';
import ProtectedRoute from './components/ProtectedRoute';
import AccessDenied from './components/AccessDenied';
import { LoadingSpinner } from './components/ui/loading-spinner';
import { useRealtimePermissions } from '@/hooks/useRealtimePermissions';

function App() {
  const { user, loading } = useAuth();
  
  // Initialize real-time permissions system
  useRealtimePermissions();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <PermissionsProvider>
            <Routes>
              <Route path="/auth" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clients"
                element={
                  <ProtectedRoute module="clients" action="view">
                    <ClientsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agents"
                element={
                  <ProtectedRoute module="agents" action="view">
                    <AgentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/policies"
                element={
                  <ProtectedRoute module="policies" action="view">
                    <PoliciesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/claims"
                element={
                  <ProtectedRoute module="claims" action="view">
                    <ClaimsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leads"
                element={
                  <ProtectedRoute module="leads" action="view">
                    <LeadsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quotations"
                element={
                  <ProtectedRoute module="quotations" action="view">
                    <QuotationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/invoices"
                element={
                  <ProtectedRoute module="invoices" action="view">
                    <InvoicesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recent-activities"
                element={
                  <ProtectedRoute module="activities" action="view">
                    <RecentActivities />
                  </ProtectedRoute>
                }
              />
              <Route path="/access-denied" element={<AccessDenied />} />
              <Route path="*" element={<AccessDenied />} />
            </Routes>
          </PermissionsProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
