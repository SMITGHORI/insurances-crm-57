
import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetails from "./pages/ClientDetails";
import ClientEdit from "./pages/ClientEdit";
import ClientDetailsView from "./pages/ClientDetailsView";
import Policies from "./pages/Policies";
import PolicyCreate from "./pages/PolicyCreate";
import PolicyDetails from "./pages/PolicyDetails";
import PolicyEdit from "./pages/PolicyEdit";
import Agents from "./pages/Agents";
import AgentDetails from "./pages/AgentDetails";
import Claims from "./pages/Claims";
import ClaimCreate from "./pages/ClaimCreate";
import ClaimDetails from "./pages/ClaimDetails";
import ClaimEdit from "./pages/ClaimEdit";
import NotFound from "./pages/NotFound";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/create" element={<ClientDetails />} />
          <Route path="clients/edit/:id" element={<ClientEdit />} />
          <Route path="clients/:id" element={<ClientDetailsView />} />
          <Route path="policies" element={<Policies />} />
          <Route path="policies/create" element={<PolicyCreate />} />
          <Route path="policies/:id" element={<PolicyDetails />} />
          <Route path="policies/edit/:id" element={<PolicyEdit />} />
          <Route path="agents" element={<Agents />} />
          <Route path="agents/:id" element={<AgentDetails />} />
          <Route path="claims" element={<Claims />} />
          <Route path="claims/create" element={<ClaimCreate />} />
          <Route path="claims/:id" element={<ClaimDetails />} />
          <Route path="claims/edit/:id" element={<ClaimEdit />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
