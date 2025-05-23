
import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import "./App.css";
import MainLayout from './components/layout/MainLayout';

// Lazy loaded components
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Clients = lazy(() => import('./pages/Clients'));
const ClientDetails = lazy(() => import('./pages/ClientDetails'));
const ClientDetailsView = lazy(() => import('./pages/ClientDetailsView'));
const ClientEdit = lazy(() => import('./pages/ClientEdit'));
const Policies = lazy(() => import('./pages/Policies'));
const PolicyDetails = lazy(() => import('./pages/PolicyDetails'));
const PolicyCreate = lazy(() => import('./pages/PolicyCreate'));
const PolicyEdit = lazy(() => import('./pages/PolicyEdit'));
const Claims = lazy(() => import('./pages/Claims'));
const ClaimDetails = lazy(() => import('./pages/ClaimDetails'));
const ClaimCreate = lazy(() => import('./pages/ClaimCreate'));
const ClaimEdit = lazy(() => import('./pages/ClaimEdit'));
const Quotations = lazy(() => import('./pages/Quotations'));
const QuotationDetails = lazy(() => import('./pages/QuotationDetails'));
const QuotationForm = lazy(() => import('./pages/QuotationForm'));
const Invoices = lazy(() => import('./pages/Invoices'));
const InvoiceDetails = lazy(() => import('./pages/InvoiceDetails'));
const InvoiceForm = lazy(() => import('./pages/InvoiceForm'));
const Agents = lazy(() => import('./pages/Agents'));
const AgentDetails = lazy(() => import('./pages/AgentDetails'));
const AgentCreate = lazy(() => import('./pages/AgentCreate'));
const Leads = lazy(() => import('./pages/Leads'));
const LeadDetails = lazy(() => import('./pages/LeadDetails'));
const LeadForm = lazy(() => import('./pages/LeadForm'));
const RecentActivities = lazy(() => import('./pages/RecentActivities'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex items-center justify-center h-screen w-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amba-blue"></div>
      </div>}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            <Route path="clients">
              <Route index element={<Clients />} />
              <Route path="create" element={<ClientDetails />} />
              <Route path=":id" element={<ClientDetailsView />} />
              <Route path="edit/:id" element={<ClientEdit />} />
            </Route>
            
            <Route path="policies">
              <Route index element={<Policies />} />
              <Route path="create" element={<PolicyCreate />} />
              <Route path=":id" element={<PolicyDetails />} />
              <Route path="edit/:id" element={<PolicyEdit />} />
            </Route>
            
            <Route path="claims">
              <Route index element={<Claims />} />
              <Route path="create" element={<ClaimCreate />} />
              <Route path=":id" element={<ClaimDetails />} />
              <Route path="edit/:id" element={<ClaimEdit />} />
            </Route>
            
            <Route path="quotations">
              <Route index element={<Quotations />} />
              <Route path="create" element={<QuotationForm />} />
              <Route path=":id" element={<QuotationDetails />} />
              <Route path="edit/:id" element={<QuotationForm />} />
            </Route>
            
            <Route path="invoices">
              <Route index element={<Invoices />} />
              <Route path="create" element={<InvoiceForm />} />
              <Route path=":id" element={<InvoiceDetails />} />
              <Route path="edit/:id" element={<InvoiceForm />} />
            </Route>
            
            <Route path="agents">
              <Route index element={<Agents />} />
              <Route path="create" element={<AgentCreate />} />
              <Route path=":id" element={<AgentDetails />} />
            </Route>
            
            <Route path="leads">
              <Route index element={<Leads />} />
              <Route path="create" element={<LeadForm />} />
              <Route path=":id" element={<LeadDetails />} />
              <Route path="edit/:id" element={<LeadForm />} />
            </Route>
            
            <Route path="activities" element={<RecentActivities />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
