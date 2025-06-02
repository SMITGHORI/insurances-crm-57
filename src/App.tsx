import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import { PermissionsProvider } from '@/contexts/PermissionsContext';
import RouteGuard from '@/components/RouteGuard';

// Lazy load components for better performance
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Clients = lazy(() => import('@/pages/Clients'));
const ClientDetails = lazy(() => import('@/pages/ClientDetails'));
const ClientDetailsView = lazy(() => import('@/pages/ClientDetailsView'));
const ClientEdit = lazy(() => import('@/pages/ClientEdit'));
const Policies = lazy(() => import('@/pages/Policies'));
const PolicyCreate = lazy(() => import('@/pages/PolicyCreate'));
const PolicyDetails = lazy(() => import('@/pages/PolicyDetails'));
const PolicyEdit = lazy(() => import('@/pages/PolicyEdit'));
const Claims = lazy(() => import('@/pages/Claims'));
const ClaimCreate = lazy(() => import('@/pages/ClaimCreate'));
const ClaimDetails = lazy(() => import('@/pages/ClaimDetails'));
const ClaimEdit = lazy(() => import('@/pages/ClaimEdit'));
const Leads = lazy(() => import('@/pages/Leads'));
const LeadForm = lazy(() => import('@/pages/LeadForm'));
const LeadDetails = lazy(() => import('@/pages/LeadDetails'));
const Quotations = lazy(() => import('@/pages/Quotations'));
const QuotationForm = lazy(() => import('@/pages/QuotationForm'));
const QuotationDetails = lazy(() => import('@/pages/QuotationDetails'));
const QuotationEdit = lazy(() => import('@/pages/QuotationEdit'));
const Invoices = lazy(() => import('@/pages/Invoices'));
const InvoiceForm = lazy(() => import('@/pages/InvoiceForm'));
const InvoiceDetails = lazy(() => import('@/pages/InvoiceDetails'));
const InvoiceEdit = lazy(() => import('@/pages/InvoiceEdit'));
const RecentActivities = lazy(() => import('@/pages/RecentActivities'));
const Agents = lazy(() => import('@/pages/Agents'));
const AgentCreate = lazy(() => import('@/pages/AgentCreate'));
const AgentDetails = lazy(() => import('@/pages/AgentDetails'));
const Settings = lazy(() => import('@/pages/Settings'));
const Auth = lazy(() => import('@/pages/Auth'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
      retry: 2,
    },
  },
});

// Full skeleton loading component - no blue spinner
const LoadingComponent = () => (
  <div className="min-h-screen bg-gray-50">
    <PageSkeleton />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PermissionsProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Suspense fallback={<LoadingComponent />}>
                <Routes>
                  {/* Auth Routes */}
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Protected Routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }>
                    {/* Dashboard */}
                    <Route index element={
                      <RouteGuard route="/dashboard">
                        <Dashboard />
                      </RouteGuard>
                    } />
                    <Route path="dashboard" element={
                      <RouteGuard route="/dashboard">
                        <Dashboard />
                      </RouteGuard>
                    } />
                    
                    {/* Client Routes */}
                    <Route path="clients" element={
                      <RouteGuard route="/clients">
                        <Clients />
                      </RouteGuard>
                    } />
                    <Route path="clients/create" element={
                      <RouteGuard requiredPermission="createClient">
                        <ClientDetails />
                      </RouteGuard>
                    } />
                    <Route path="clients/:id" element={
                      <RouteGuard route="/clients">
                        <ClientDetailsView />
                      </RouteGuard>
                    } />
                    <Route path="clients/:id/edit" element={
                      <RouteGuard route="/clients">
                        <ClientEdit />
                      </RouteGuard>
                    } />
                    
                    {/* Policy Routes */}
                    <Route path="policies" element={
                      <RouteGuard route="/policies">
                        <Policies />
                      </RouteGuard>
                    } />
                    <Route path="policies/create" element={
                      <RouteGuard requiredPermission="createPolicy">
                        <PolicyCreate />
                      </RouteGuard>
                    } />
                    <Route path="policies/:id" element={
                      <RouteGuard route="/policies">
                        <PolicyDetails />
                      </RouteGuard>
                    } />
                    <Route path="policies/:id/edit" element={
                      <RouteGuard route="/policies">
                        <PolicyEdit />
                      </RouteGuard>
                    } />
                    
                    {/* Claims Routes */}
                    <Route path="claims" element={
                      <RouteGuard route="/claims">
                        <Claims />
                      </RouteGuard>
                    } />
                    <Route path="claims/create" element={
                      <RouteGuard requiredPermission="createClaim">
                        <ClaimCreate />
                      </RouteGuard>
                    } />
                    <Route path="claims/:id" element={
                      <RouteGuard route="/claims">
                        <ClaimDetails />
                      </RouteGuard>
                    } />
                    <Route path="claims/:id/edit" element={
                      <RouteGuard route="/claims">
                        <ClaimEdit />
                      </RouteGuard>
                    } />
                    
                    {/* Leads Routes */}
                    <Route path="leads" element={
                      <RouteGuard route="/leads">
                        <Leads />
                      </RouteGuard>
                    } />
                    <Route path="leads/create" element={
                      <RouteGuard requiredPermission="createLead">
                        <LeadForm />
                      </RouteGuard>
                    } />
                    <Route path="leads/:id" element={
                      <RouteGuard route="/leads">
                        <LeadDetails />
                      </RouteGuard>
                    } />
                    <Route path="leads/:id/edit" element={
                      <RouteGuard route="/leads">
                        <LeadForm />
                      </RouteGuard>
                    } />
                    
                    {/* Quotations Routes */}
                    <Route path="quotations" element={
                      <RouteGuard route="/quotations">
                        <Quotations />
                      </RouteGuard>
                    } />
                    <Route path="quotations/create" element={
                      <RouteGuard requiredPermission="createQuotation">
                        <QuotationForm />
                      </RouteGuard>
                    } />
                    <Route path="quotations/:id" element={
                      <RouteGuard route="/quotations">
                        <QuotationDetails />
                      </RouteGuard>
                    } />
                    <Route path="quotations/:id/edit" element={
                      <RouteGuard route="/quotations">
                        <QuotationEdit />
                      </RouteGuard>
                    } />
                    
                    {/* Invoices Routes */}
                    <Route path="invoices" element={
                      <RouteGuard route="/invoices">
                        <Invoices />
                      </RouteGuard>
                    } />
                    <Route path="invoices/create" element={
                      <RouteGuard requiredPermission="createInvoice">
                        <InvoiceForm />
                      </RouteGuard>
                    } />
                    <Route path="invoices/:id" element={
                      <RouteGuard route="/invoices">
                        <InvoiceDetails />
                      </RouteGuard>
                    } />
                    <Route path="invoices/:id/edit" element={
                      <RouteGuard route="/invoices">
                        <InvoiceEdit />
                      </RouteGuard>
                    } />
                    
                    {/* Activities Routes */}
                    <Route path="activities" element={
                      <RouteGuard route="/recent-activities">
                        <RecentActivities />
                      </RouteGuard>
                    } />
                    <Route path="recent-activities" element={
                      <RouteGuard route="/recent-activities">
                        <RecentActivities />
                      </RouteGuard>
                    } />
                    
                    {/* Agents Routes - Only for Super Admin */}
                    <Route path="agents" element={
                      <RouteGuard route="/agents">
                        <Agents />
                      </RouteGuard>
                    } />
                    <Route path="agents/create" element={
                      <RouteGuard requiredPermission="createAgent">
                        <AgentCreate />
                      </RouteGuard>
                    } />
                    <Route path="agents/:id" element={
                      <RouteGuard route="/agents">
                        <AgentDetails />
                      </RouteGuard>
                    } />
                    
                    {/* Settings */}
                    <Route path="settings" element={
                      <RouteGuard route="/settings">
                        <Settings />
                      </RouteGuard>
                    } />
                  </Route>
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Toaster position="top-right" richColors />
            </div>
          </Router>
        </PermissionsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
