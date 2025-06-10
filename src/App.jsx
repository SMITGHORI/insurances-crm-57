import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Dashboard from './components/Dashboard';
import Clients from './components/clients/Clients';
import ClientDetails from './components/clients/ClientDetails';
import Policies from './components/policies/Policies';
import PolicyDetails from './components/policies/PolicyDetails';
import Users from './components/users/Users';
import Profile from './components/Profile';
import Login from './components/Login';
import Register from './components/Register';
import RequireAuth from './components/RequireAuth';
import Unauthorized from './components/Unauthorized';
import Layout from './components/Layout';
import Missing from './components/Missing';
import Roles from './components/roles/Roles';
import Communication from './components/communication/Communication';
import OffersManager from './components/communication/OffersManager';
import AutomationRules from './components/communication/AutomationRules';
import { Gift } from 'lucide-react';
import OffersModule from './components/offers/OffersModule';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public routes */}
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="unauthorized" element={<Unauthorized />} />

              {/* Protected routes */}
              <Route element={<RequireAuth allowedRoles={['agent', 'manager', 'admin']} />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />

                <Route path="clients" element={<Clients />} />
                <Route path="clients/:id" element={<ClientDetails />} />

                <Route path="policies" element={<Policies />} />
                <Route path="policies/:id" element={<PolicyDetails />} />

                <Route path="communication" element={<Communication />} />
                <Route path="offers-manager" element={<OffersManager />} />
                 <Route path="automation-rules" element={<AutomationRules />} />
              </Route>

              {/* Admin routes */}
              <Route element={<RequireAuth allowedRoles={['admin']} />}>
                <Route path="users" element={<Users />} />
                <Route path="roles" element={<Roles />} />
              </Route>

              {/* Catch all - to handle wrong URLs */}
              <Route path="*" element={<Missing />} />
            </Route>
            
            <Route path="/offers" element={<OffersModule />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
