
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetails from "./pages/ClientDetails";
import NotFound from "./pages/NotFound";
import Policies from "./pages/Policies";
import PolicyDetails from "./pages/PolicyDetails";
import PolicyEdit from "./pages/PolicyEdit";
import PolicyCreate from "./pages/PolicyCreate";
import Agents from "./pages/Agents";
import AgentDetails from "./pages/AgentDetails";
import AgentCreate from "./pages/AgentCreate";
import Claims from "./pages/Claims";
import ClaimDetails from "./pages/ClaimDetails";
import ClaimCreate from "./pages/ClaimCreate";
import Leads from "./pages/Leads";
import LeadDetails from "./pages/LeadDetails";
import LeadForm from "./pages/LeadForm";
import Quotations from "./pages/Quotations";
import QuotationDetails from "./pages/QuotationDetails";
import QuotationForm from "./pages/QuotationForm";
import Invoices from "./pages/Invoices";
import InvoiceDetails from "./pages/InvoiceDetails";
import InvoiceForm from "./pages/InvoiceForm";
import RecentActivities from "./pages/RecentActivities";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Navigate to="/auth" replace />} />
          
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:id" element={<ClientDetails />} />
            <Route path="/clients/edit/:id" element={<Clients />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/policies/:id" element={<PolicyDetails />} />
            <Route path="/policies/create" element={<PolicyCreate />} />
            <Route path="/policies/edit/:id" element={<PolicyEdit />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/agents/:id" element={<AgentDetails />} />
            <Route path="/agents/create" element={<AgentCreate />} />
            <Route path="/agents/bulk-upload" element={<Agents />} />
            <Route path="/claims" element={<Claims />} />
            <Route path="/claims/:id" element={<ClaimDetails />} />
            <Route path="/claims/create" element={<ClaimCreate />} />
            <Route path="/claims/edit/:id" element={<ClaimDetails />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/leads/:id" element={<LeadDetails />} />
            <Route path="/leads/create" element={<LeadForm />} />
            <Route path="/leads/edit/:id" element={<LeadForm />} />
            <Route path="/quotations" element={<Quotations />} />
            <Route path="/quotations/:id" element={<QuotationDetails />} />
            <Route path="/quotations/create" element={<QuotationForm />} />
            <Route path="/quotations/edit/:id" element={<QuotationForm />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/:id" element={<InvoiceDetails />} />
            <Route path="/invoices/create" element={<InvoiceForm />} />
            <Route path="/invoices/edit/:id" element={<InvoiceForm />} />
            <Route path="/recent-activities" element={<RecentActivities />} />
            <Route path="/settings" element={<Dashboard />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
