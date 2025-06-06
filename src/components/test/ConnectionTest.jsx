
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { clientsBackendApi } from '../../services/api/clientsApiBackend';

const ConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('idle');
  const [testResults, setTestResults] = useState({});
  const [clientsData, setClientsData] = useState(null);

  const testBackendConnection = async () => {
    setConnectionStatus('testing');
    try {
      const healthCheck = await clientsBackendApi.testConnection();
      setTestResults(prev => ({ ...prev, health: healthCheck }));
      
      // Test clients API
      const clientsResponse = await clientsBackendApi.getClients({ limit: 5 });
      setTestResults(prev => ({ ...prev, clients: clientsResponse }));
      setClientsData(clientsResponse);
      
      setConnectionStatus('success');
    } catch (error) {
      setTestResults(prev => ({ ...prev, error: error.message }));
      setConnectionStatus('error');
    }
  };

  const createTestClient = async () => {
    try {
      const testClient = {
        clientType: 'individual',
        firstName: 'Test',
        lastName: 'Client',
        email: `test${Date.now()}@example.com`,
        phone: '9876543210',
        dob: '1990-01-01',
        gender: 'male',
        panNumber: 'ABCDE1234F',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456'
      };
      
      const response = await clientsBackendApi.createClient(testClient);
      setTestResults(prev => ({ ...prev, createClient: response }));
      
      // Refresh clients list
      const updatedClients = await clientsBackendApi.getClients({ limit: 5 });
      setClientsData(updatedClients);
    } catch (error) {
      setTestResults(prev => ({ ...prev, createError: error.message }));
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Backend Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testBackendConnection} disabled={connectionStatus === 'testing'}>
            {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
          </Button>
          
          <Button onClick={createTestClient} variant="outline">
            Create Test Client
          </Button>
          
          <Badge variant={
            connectionStatus === 'success' ? 'default' : 
            connectionStatus === 'error' ? 'destructive' : 
            'secondary'
          }>
            {connectionStatus}
          </Badge>
        </div>

        {testResults.health && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold">Health Check Result:</h3>
            <pre className="text-sm">{JSON.stringify(testResults.health, null, 2)}</pre>
          </div>
        )}

        {testResults.error && (
          <div className="p-4 bg-red-50 rounded-lg">
            <h3 className="font-semibold">Error:</h3>
            <p className="text-sm text-red-600">{testResults.error}</p>
          </div>
        )}

        {clientsData && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold">Clients Data:</h3>
            <p className="text-sm">Total: {clientsData.total}</p>
            <pre className="text-sm mt-2">{JSON.stringify(clientsData.data, null, 2)}</pre>
          </div>
        )}

        {testResults.createClient && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold">Created Client:</h3>
            <pre className="text-sm">{JSON.stringify(testResults.createClient, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionTest;
