
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
            <Route path="/claims" element={<Dashboard />} />
            <Route path="/leads" element={<Dashboard />} />
            <Route path="/quotations" element={<Dashboard />} />
            <Route path="/invoices" element={<Dashboard />} />
            <Route path="/calendar" element={<Dashboard />} />
            <Route path="/settings" element={<Dashboard />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
