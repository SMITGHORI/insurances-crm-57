
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import ClientEdit from './pages/ClientEdit';
import Policies from './pages/Policies';
import PolicyDetail from './pages/PolicyDetail';
import Claims from './pages/Claims';
import ClaimDetail from './pages/ClaimDetail';
import Leads from './pages/Leads';
import LeadDetail from './pages/LeadDetail';
import Quotations from './pages/Quotations';
import QuotationDetail from './pages/QuotationDetail';
import RecentActivities from './pages/RecentActivities';
import Communication from './pages/Communication';
import Broadcast from './pages/Broadcast';

function App() {
  return (
    <Router>
      <Routes>
        {/* Dashboard Route */}
        <Route path="/" element={<Dashboard />} />

        {/* Client Routes */}
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:id" element={<ClientDetail />} />
        <Route path="/clients/:id/edit" element={<ClientEdit />} />

        {/* Policy Routes */}
        <Route path="/policies" element={<Policies />} />
        <Route path="/policies/:id" element={<PolicyDetail />} />
        
        {/* Claims Routes */}
        <Route path="/claims" element={<Claims />} />
        <Route path="/claims/:id" element={<ClaimDetail />} />
        
        {/* Leads Routes */  
        <Route path="/leads" element={<Leads />} />
        <Route path="/leads/:id" element={<LeadDetail />} />

        {/* Quotations Routes */}
        <Route path="/quotations" element={<Quotations />} />
        <Route path="/quotations/:id" element={<QuotationDetail />} />

        {/* Communication Routes */}
        <Route path="/communication" element={<Communication />} />
        <Route path="/communication/:id" element={<Communication />} />
        <Route path="/communication/create" element={<Communication />} />
        
        {/* Broadcast Routes */}
        <Route path="/broadcast" element={<Broadcast />} />
        <Route path="/broadcast/:id" element={<Broadcast />} />
        <Route path="/broadcast/create" element={<Broadcast />} />
        <Route path="/broadcast/analytics" element={<Broadcast />} />
        
        {/* Recent Activities Route */}
        <Route path="/recent-activities" element={<RecentActivities />} />
      </Routes>
    </Router>
  );
}

export default App;
