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
        
        {/* Leads Routes */}  
        <Route path="/leads" element={<Leads />} />
        <Route path="/leads/:id" element={<LeadDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
