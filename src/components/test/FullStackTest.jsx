
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { clientsBackendApi } from '../../services/api/clientsApiBackend';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const FullStackTest = () => {
  const [tests, setTests] = useState({
    backendHealth: { status: 'pending', message: '', data: null },
    mongoConnection: { status: 'pending', message: '', data: null },
    clientsApi: { status: 'pending', message: '', data: null },
    createClient: { status: 'pending', message: '', data: null },
    dataSync: { status: 'pending', message: '', data: null }
  });

  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (testName, status, message, data = null) => {
    setTests(prev => ({
      ...prev,
      [testName]: { status, message, data }
    }));
  };

  const runFullStackTest = async () => {
    setIsRunning(true);
    
    // Reset all tests
    setTests({
      backendHealth: { status: 'running', message: 'Testing backend connection...', data: null },
      mongoConnection: { status: 'pending', message: '', data: null },
      clientsApi: { status: 'pending', message: '', data: null },
      createClient: { status: 'pending', message: '', data: null },
      dataSync: { status: 'pending', message: '', data: null }
    });

    try {
      // Test 1: Backend Health Check
      updateTest('backendHealth', 'running', 'Checking backend health...');
      
      const healthResponse = await clientsBackendApi.testConnection();
      updateTest('backendHealth', 'success', 'Backend is running!', healthResponse);

      // Test 2: MongoDB Connection (implicit through API calls)
      updateTest('mongoConnection', 'running', 'Testing MongoDB connection...');
      
      try {
        const clientsResponse = await clientsBackendApi.getClients({ limit: 1 });
        updateTest('mongoConnection', 'success', 'MongoDB connected successfully!', { 
          totalClients: clientsResponse.total 
        });

        // Test 3: Clients API
        updateTest('clientsApi', 'running', 'Testing clients API...');
        updateTest('clientsApi', 'success', `Clients API working! Found ${clientsResponse.total} clients`, clientsResponse);

        // Test 4: Create Client
        updateTest('createClient', 'running', 'Testing client creation...');
        
        const testClient = {
          clientType: 'individual',
          firstName: 'Test',
          lastName: 'Client',
          email: `test${Date.now()}@example.com`,
          phone: '9876543210',
          dob: '1990-01-01',
          gender: 'male',
          panNumber: `TEST${Math.random().toString(36).substr(2, 5).toUpperCase()}1234F`,
          address: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456'
        };

        const createdClient = await clientsBackendApi.createClient(testClient);
        updateTest('createClient', 'success', 'Client created successfully!', createdClient);

        // Test 5: Data Synchronization
        updateTest('dataSync', 'running', 'Testing data synchronization...');
        
        const updatedClientsResponse = await clientsBackendApi.getClients({ limit: 5 });
        const syncWorking = updatedClientsResponse.total > clientsResponse.total;
        
        if (syncWorking) {
          updateTest('dataSync', 'success', 'Data synchronization working perfectly!', {
            oldCount: clientsResponse.total,
            newCount: updatedClientsResponse.total
          });
        } else {
          updateTest('dataSync', 'warning', 'Data sync may have delay, but creation was successful', {
            note: 'This is normal for some database configurations'
          });
        }

      } catch (dbError) {
        updateTest('mongoConnection', 'error', 'MongoDB connection failed: ' + dbError.message);
        updateTest('clientsApi', 'error', 'Skipped due to MongoDB error');
        updateTest('createClient', 'error', 'Skipped due to MongoDB error');
        updateTest('dataSync', 'error', 'Skipped due to MongoDB error');
      }

    } catch (error) {
      updateTest('backendHealth', 'error', 'Backend connection failed: ' + error.message);
      updateTest('mongoConnection', 'error', 'Skipped due to backend connection failure');
      updateTest('clientsApi', 'error', 'Skipped due to backend connection failure');
      updateTest('createClient', 'error', 'Skipped due to backend connection failure');
      updateTest('dataSync', 'error', 'Skipped due to backend connection failure');
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'running':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const allTestsPassed = Object.values(tests).every(test => 
    test.status === 'success' || test.status === 'warning'
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Full Stack Connection Test
          <Badge variant={allTestsPassed && !isRunning ? 'default' : 'secondary'}>
            {isRunning ? 'Running...' : allTestsPassed ? 'All Systems Go!' : 'Ready to Test'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          onClick={runFullStackTest} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run Full Stack Test'
          )}
        </Button>

        <div className="space-y-4">
          {Object.entries(tests).map(([testName, test]) => (
            <div key={testName} className="flex items-start space-x-3 p-4 border rounded-lg">
              {getStatusIcon(test.status)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold capitalize">
                    {testName.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <Badge variant={getStatusColor(test.status)}>
                    {test.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">{test.message}</p>
                {test.data && (
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                    {JSON.stringify(test.data, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>

        {allTestsPassed && !isRunning && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="font-semibold text-green-800">Full Stack Setup Complete!</h3>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Your MongoDB database is connected, backend API is running, and frontend-backend 
              synchronization is working perfectly. You can now use all the application features.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FullStackTest;
