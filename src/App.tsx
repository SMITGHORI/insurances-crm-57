

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import './App.css';

// Import context providers
import { AuthProvider } from './contexts/AuthContext';
import { PermissionsProvider } from './contexts/PermissionsContext';

// Import your existing components
import MainLayout from './components/layout/MainLayout';
import ConnectionTest from './components/test/ConnectionTest';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Check if error has status property safely
        const errorWithStatus = error as any;
        if (errorWithStatus?.status === 404) return false;
        return failureCount < 2;
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PermissionsProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<ConnectionTest />} />
                  {/* Add your other routes here */}
                </Route>
              </Routes>
              <Toaster position="top-right" richColors />
            </div>
          </Router>
        </PermissionsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
