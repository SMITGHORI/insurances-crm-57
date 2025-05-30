
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

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

// Loading component that matches the background
const LoadingComponent = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  
                  {/* Client Routes */}
                  <Route path="clients" element={<Clients />} />
                  <Route path="clients/create" element={<ClientDetails />} />
                  <Route path="clients/:id" element={<ClientDetailsView />} />
                  <Route path="clients/:id/edit" element={<ClientEdit />} />
                  
                  {/* Policy Routes */}
                  <Route path="policies" element={<Policies />} />
                  <Route path="policies/create" element={<PolicyCreate />} />
                  <Route path="policies/:id" element={<PolicyDetails />} />
                  <Route path="policies/:id/edit" element={<PolicyEdit />} />
                  
                  {/* Claims Routes */}
                  <Route path="claims" element={<Claims />} />
                  <Route path="claims/create" element={<ClaimCreate />} />
                  <Route path="claims/:id" element={<ClaimDetails />} />
                  <Route path="claims/:id/edit" element={<ClaimEdit />} />
                  
                  {/* Leads Routes */}
                  <Route path="leads" element={<Leads />} />
                  <Route path="leads/create" element={<LeadForm />} />
                  <Route path="leads/:id" element={<LeadDetails />} />
                  <Route path="leads/:id/edit" element={<LeadForm />} />
                  
                  {/* Quotations Routes */}
                  <Route path="quotations" element={<Quotations />} />
                  <Route path="quotations/create" element={<QuotationForm />} />
                  <Route path="quotations/:id" element={<QuotationDetails />} />
                  <Route path="quotations/:id/edit" element={<QuotationEdit />} />
                  
                  {/* Invoices Routes */}
                  <Route path="invoices" element={<Invoices />} />
                  <Route path="invoices/create" element={<InvoiceForm />} />
                  <Route path="invoices/:id" element={<InvoiceDetails />} />
                  <Route path="invoices/:id/edit" element={<InvoiceEdit />} />
                  
                  {/* Activities Routes */}
                  <Route path="activities" element={<RecentActivities />} />
                  <Route path="recent-activities" element={<RecentActivities />} />
                  
                  {/* Agents Routes */}
                  <Route path="agents" element={<Agents />} />
                  <Route path="agents/create" element={<AgentCreate />} />
                  <Route path="agents/:id" element={<AgentDetails />} />
                  
                  {/* Settings */}
                  <Route path="settings" element={<Settings />} />
                </Route>
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
