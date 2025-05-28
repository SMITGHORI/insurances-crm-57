
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Leads from './pages/Leads';
import LeadDetails from './pages/LeadDetails';
import LeadForm from './pages/LeadForm';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import ClientEdit from './pages/ClientEdit';
import ClientDetailsView from './pages/ClientDetailsView';
import Policies from './pages/Policies';
import PolicyDetails from './pages/PolicyDetails';
import PolicyCreate from './pages/PolicyCreate';
import PolicyEdit from './pages/PolicyEdit';
import Claims from './pages/Claims';
import ClaimDetails from './pages/ClaimDetails';
import ClaimCreate from './pages/ClaimCreate';
import ClaimEdit from './pages/ClaimEdit';
import Quotations from './pages/Quotations';
import QuotationDetails from './pages/QuotationDetails';
import QuotationForm from './pages/QuotationForm';
import QuotationEdit from './pages/QuotationEdit';
import Invoices from './pages/Invoices';
import InvoiceDetails from './pages/InvoiceDetails';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceEdit from './pages/InvoiceEdit';
import Agents from './pages/Agents';
import AgentDetails from './pages/AgentDetails';
import AgentCreate from './pages/AgentCreate';
import Settings from './pages/Settings';
import RecentActivities from './pages/RecentActivities';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Index />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Leads Routes */}
            <Route path="leads" element={<Leads />} />
            <Route path="leads/:id" element={<LeadDetails />} />
            <Route path="leads/create" element={<LeadForm />} />
            <Route path="leads/edit/:id" element={<LeadForm />} />
            
            {/* Clients Routes */}
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetailsView />} />
            <Route path="clients/edit/:id" element={<ClientEdit />} />
            
            {/* Policies Routes */}
            <Route path="policies" element={<Policies />} />
            <Route path="policies/:id" element={<PolicyDetails />} />
            <Route path="policies/create" element={<PolicyCreate />} />
            <Route path="policies/edit/:id" element={<PolicyEdit />} />
            
            {/* Claims Routes */}
            <Route path="claims" element={<Claims />} />
            <Route path="claims/:id" element={<ClaimDetails />} />
            <Route path="claims/create" element={<ClaimCreate />} />
            <Route path="claims/edit/:id" element={<ClaimEdit />} />
            
            {/* Quotations Routes */}
            <Route path="quotations" element={<Quotations />} />
            <Route path="quotations/:id" element={<QuotationDetails />} />
            <Route path="quotations/create" element={<QuotationForm />} />
            <Route path="quotations/edit/:id" element={<QuotationEdit />} />
            
            {/* Invoices Routes */}
            <Route path="invoices" element={<Invoices />} />
            <Route path="invoices/:id" element={<InvoiceDetails />} />
            <Route path="invoices/create" element={<InvoiceForm />} />
            <Route path="invoices/edit/:id" element={<InvoiceEdit />} />
            
            {/* Agents Routes */}
            <Route path="agents" element={<Agents />} />
            <Route path="agents/:id" element={<AgentDetails />} />
            <Route path="agents/create" element={<AgentCreate />} />
            
            {/* Settings & Activities */}
            <Route path="settings" element={<Settings />} />
            <Route path="activities" element={<RecentActivities />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
