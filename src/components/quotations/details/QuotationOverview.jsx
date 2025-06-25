
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  User, 
  Building, 
  Calendar, 
  DollarSign, 
  Mail, 
  Phone,
  MapPin,
  Edit,
  Send
} from 'lucide-react';

const QuotationOverview = ({ quotation }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-purple-100 text-purple-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Quotation Overview</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {quotation.status === 'draft' && (
            <Button size="sm">
              <Send className="mr-2 h-4 w-4" />
              Send Quotation
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Quotation Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Quote ID:</span>
              <span className="font-medium">{quotation.quoteId}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <Badge className={getStatusColor(quotation.status)}>
                {quotation.status}
              </Badge>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Insurance Type:</span>
              <span className="font-medium">{quotation.insuranceType}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Company:</span>
              <span className="font-medium">{quotation.insuranceCompany}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Created Date:</span>
              <span className="font-medium">{formatDate(quotation.createdDate)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Valid Until:</span>
              <span className="font-medium">{formatDate(quotation.validUntil)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Client Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{quotation.clientName}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Email:</span>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{quotation.clientEmail}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Phone:</span>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{quotation.clientPhone}</span>
              </div>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Agent:</span>
              <span className="font-medium">{quotation.agentName}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Product Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quotation.products.map((product, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-2">{product.name}</h4>
                <p className="text-gray-600 mb-3">{product.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sum Insured:</span>
                    <span className="font-medium">{formatCurrency(product.sumInsured)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Premium:</span>
                    <span className="font-medium text-green-600">{formatCurrency(product.premium)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Financial Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Sum Insured</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(quotation.sumInsured)}</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Premium</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(quotation.premium)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {quotation.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{quotation.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuotationOverview;
