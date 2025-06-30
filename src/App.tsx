import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { PermissionsProvider } from '@/contexts/PermissionsContext';
import MainLayout from '@/components/layout/MainLayout';
import RouteGuard from '@/components/RouteGuard';

// Import pages
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import ClientDetails from '@/pages/ClientDetails';
import ClientEdit from '@/pages/ClientEdit';
import Agents from '@/pages/Agents';
import AgentDetails from '@/pages/AgentDetails';
import AgentCreate from '@/pages/AgentCreate';
import Policies from '@/pages/Policies';
import PolicyDetails from '@/pages/PolicyDetails';
import PolicyCreate from '@/pages/PolicyCreate';
import PolicyEdit from '@/pages/PolicyEdit';
import Claims from '@/pages/Claims';
import ClaimDetails from '@/pages/ClaimDetails';
import ClaimCreate from '@/pages/ClaimCreate';
import ClaimEdit from '@/pages/ClaimEdit';
import Leads from '@/pages/Leads';
import LeadDetails from '@/pages/LeadDetails';
import LeadForm from '@/pages/LeadForm';
import Quotations from '@/pages/Quotations';
import QuotationsPage from '@/pages/QuotationsPage';
import QuotationDetails from '@/pages/QuotationDetails';
import QuotationForm from '@/pages/QuotationForm';
import QuotationEdit from '@/pages/QuotationEdit';
import QuotesDashboardPage from '@/pages/QuotesDashboardPage';
import Invoices from '@/pages/Invoices';
import InvoiceDetails from '@/pages/InvoiceDetails';
import InvoiceForm from '@/pages/InvoiceForm';
import InvoiceEdit from '@/pages/InvoiceEdit';
import Communication from '@/pages/Communication';
import Broadcast from '@/pages/Broadcast';
import RecentActivities from '@/pages/RecentActivities';
import Settings from '@/pages/Settings';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';

// Create a client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PermissionsProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected routes */}
                <Route path="/" element={<RouteGuard><MainLayout /></RouteGuard>}>
                  <Route index element={<Index />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  
                  {/* Client routes */}
                  <Route path="clients" element={<Clients />} />
                  <Route path="clients/:id" element={<ClientDetails />} />
                  <Route path="clients/:id/edit" element={<ClientEdit />} />
                  
                  {/* Agent routes */}
                  <Route path="agents" element={<Agents />} />
                  <Route path="agents/create" element={<AgentCreate />} />
                  <Route path="agents/:id" element={<AgentDetails />} />
                  
                  {/* Policy routes */}
                  <Route path="policies" element={<Policies />} />
                  <Route path="policies/create" element={<PolicyCreate />} />
                  <Route path="policies/:id" element={<PolicyDetails />} />
                  <Route path="policies/:id/edit" element={<PolicyEdit />} />
                  
                  {/* Claim routes */}
                  <Route path="claims" element={<Claims />} />
                  <Route path="claims/create" element={<ClaimCreate />} />
                  <Route path="claims/:id" element={<ClaimDetails />} />
                  <Route path="claims/:id/edit" element={<ClaimEdit />} />
                  
                  {/* Lead routes */}
                  <Route path="leads" element={<Leads />} />
                  <Route path="leads/create" element={<LeadForm />} />
                  <Route path="leads/:id" element={<LeadDetails />} />
                  <Route path="leads/:id/edit" element={<LeadForm />} />
                  
                  {/* Quotation routes */}
                  <Route path="quotations" element={<Quotations />} />
                  <Route path="quotations/dashboard" element={<QuotesDashboardPage />} />
                  <Route path="quotations/create" element={<QuotationForm />} />
                  <Route path="quotations/lead/:leadId" element={<QuotationsPage />} />
                  <Route path="quotations/quote/:quotationId" element={<QuotationsPage />} />
                  <Route path="quotations/:id" element={<QuotationDetails />} />
                  <Route path="quotations/:id/edit" element={<QuotationEdit />} />
                  
                  {/* Invoice routes */}
                  <Route path="invoices" element={<Invoices />} />
                  <Route path="invoices/create" element={<InvoiceForm />} />
                  <Route path="invoices/:id" element={<InvoiceDetails />} />
                  <Route path="invoices/:id/edit" element={<InvoiceEdit />} />
                  
                  {/* Communication routes */}
                  <Route path="communication" element={<Communication />} />
                  <Route path="broadcast" element={<Broadcast />} />
                  
                  {/* Other routes */}
                  <Route path="recent-activities" element={<RecentActivities />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                
                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </PermissionsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
