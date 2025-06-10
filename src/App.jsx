import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { PermissionsProvider } from '@/contexts/PermissionsContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';

// Import pages
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import ClientDetails from '@/pages/ClientDetails';
import ClientEdit from '@/pages/ClientEdit';
import Quotations from '@/pages/Quotations';
import QuotationDetails from '@/pages/QuotationDetails';
import QuotationForm from '@/pages/QuotationForm';
import QuotationEdit from '@/pages/QuotationEdit';
import Policies from '@/pages/Policies';
import PolicyDetails from '@/pages/PolicyDetails';
import PolicyCreate from '@/pages/PolicyCreate';
import PolicyEdit from '@/pages/PolicyEdit';
import Claims from '@/pages/Claims';
import ClaimDetails from '@/pages/ClaimDetails';
import ClaimCreate from '@/pages/ClaimCreate';
import ClaimEdit from '@/pages/ClaimEdit';
import Agents from '@/pages/Agents';
import AgentDetails from '@/pages/AgentDetails';
import AgentCreate from '@/pages/AgentCreate';
import Leads from '@/pages/Leads';
import LeadDetails from '@/pages/LeadDetails';
import LeadForm from '@/pages/LeadForm';
import Invoices from '@/pages/Invoices';
import InvoiceDetails from '@/pages/InvoiceDetails';
import InvoiceForm from '@/pages/InvoiceForm';
import InvoiceEdit from '@/pages/InvoiceEdit';
import RecentActivities from '@/pages/RecentActivities';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PermissionsProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                <Route element={<ProtectedRoute />}>
                  <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* Clients Routes */}
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/clients/:id" element={<ClientDetails />} />
                    <Route path="/clients/:id/edit" element={<ClientEdit />} />
                    
                    {/* Quotations Routes */}
                    <Route path="/quotations" element={<Quotations />} />
                    <Route path="/quotations/create" element={<QuotationForm />} />
                    <Route path="/quotations/:id" element={<QuotationDetails />} />
                    <Route path="/quotations/edit/:id" element={<QuotationEdit />} />
                    
                    {/* Policies Routes */}
                    <Route path="/policies" element={<Policies />} />
                    <Route path="/policies/create" element={<PolicyCreate />} />
                    <Route path="/policies/:id" element={<PolicyDetails />} />
                    <Route path="/policies/:id/edit" element={<PolicyEdit />} />
                    
                    {/* Claims Routes */}
                    <Route path="/claims" element={<Claims />} />
                    <Route path="/claims/create" element={<ClaimCreate />} />
                    <Route path="/claims/:id" element={<ClaimDetails />} />
                    <Route path="/claims/:id/edit" element={<ClaimEdit />} />
                    
                    {/* Agents Routes */}
                    <Route path="/agents" element={<Agents />} />
                    <Route path="/agents/create" element={<AgentCreate />} />
                    <Route path="/agents/:id" element={<AgentDetails />} />
                    
                    {/* Leads Routes */}
                    <Route path="/leads" element={<Leads />} />
                    <Route path="/leads/create" element={<LeadForm />} />
                    <Route path="/leads/:id" element={<LeadDetails />} />
                    <Route path="/leads/:id/edit" element={<LeadForm />} />
                    
                    {/* Invoices Routes */}
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/invoices/create" element={<InvoiceForm />} />
                    <Route path="/invoices/:id" element={<InvoiceDetails />} />
                    <Route path="/invoices/:id/edit" element={<InvoiceEdit />} />
                    
                    {/* Other Routes */}
                    <Route path="/activities" element={<RecentActivities />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
          </Router>
        </PermissionsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
