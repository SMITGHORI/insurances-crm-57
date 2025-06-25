
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, Building, Group, Mail, Phone, MapPin, 
  Calendar, Briefcase, CreditCard, FileText 
} from 'lucide-react';

const ClientOverview = ({ client }) => {
  const getClientTypeIcon = () => {
    switch (client.clientType || client.type) {
      case 'individual':
      case 'Individual':
        return <User className="h-6 w-6 text-blue-500" />;
      case 'corporate':
      case 'Corporate':
        return <Building className="h-6 w-6 text-purple-500" />;
      case 'group':
      case 'Group':
        return <Group className="h-6 w-6 text-green-500" />;
      default:
        return <User className="h-6 w-6 text-gray-500" />;
    }
  };

  const getDisplayName = () => {
    if (client.name) return client.name;
    if (client.firstName && client.lastName) {
      return `${client.firstName} ${client.lastName}`;
    }
    if (client.companyName) return client.companyName;
    if (client.groupName) return client.groupName;
    return 'Unknown Client';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-full">
              {getClientTypeIcon()}
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">{getDisplayName()}</CardTitle>
              <p className="text-sm text-gray-500 font-mono">{client.clientId}</p>
            </div>
            <Badge className={client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {client.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{client.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{client.phone || client.contact || 'No contact provided'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{client.address || client.location || 'No address provided'}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Additional Information</h3>
              {(client.clientType === 'individual' || client.type === 'Individual') && (
                <div className="space-y-2">
                  {client.dob && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>DOB: {new Date(client.dob).toLocaleDateString()}</span>
                    </div>
                  )}
                  {client.occupation && (
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span>Occupation: {client.occupation}</span>
                    </div>
                  )}
                  {client.panNumber && (
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <span>PAN: {client.panNumber}</span>
                    </div>
                  )}
                </div>
              )}
              
              {(client.clientType === 'corporate' || client.type === 'Corporate') && (
                <div className="space-y-2">
                  {client.registrationNo && (
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span>Registration: {client.registrationNo}</span>
                    </div>
                  )}
                  {client.gstNumber && (
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <span>GST: {client.gstNumber}</span>
                    </div>
                  )}
                  {client.industry && (
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span>Industry: {client.industry}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {client.policies || 0}
            </div>
            <div className="text-sm text-gray-600">Active Policies</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              ₹{client.totalPremium?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-600">Total Premium</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {client.claims || 0}
            </div>
            <div className="text-sm text-gray-600">Claims Filed</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientOverview;
