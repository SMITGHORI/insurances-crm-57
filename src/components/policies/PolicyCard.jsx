
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Building, Shield, User, Users, Phone, Mail, Calendar as CalendarIcon } from 'lucide-react';

const PolicyCard = ({ policy }) => {
  // Get badge color based on policy status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'In Force':
        return 'bg-green-100 text-green-800';
      case 'Proposal':
        return 'bg-blue-100 text-blue-800';
      case 'Grace':
        return 'bg-yellow-100 text-yellow-800';
      case 'Lapsed':
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Surrendered':
      case 'Matured':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" /> 
            Insurance Company Policy Card
          </CardTitle>
          <div className="text-sm text-gray-500">
            {policy.insuranceCompany || 'Insurance Provider'}
          </div>
        </div>
        <Badge className={getStatusBadgeClass(policy.status)}>
          {policy.status}
        </Badge>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Insurance Company Policy Number</h3>
            <p className="font-semibold">{policy.insurerPolicyNumber || 'Not Provided'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">AMB Internal Reference</h3>
            <p className="font-semibold">{policy.policyNumber}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Insurance Company</h3>
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4 text-blue-600" />
              <p>{policy.insuranceCompany || 'Not specified'}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Plan Name</h3>
            <p>{policy.planName || 'Not specified'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Policy Type</h3>
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-blue-600" />
              <p>{policy.type}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Sum Assured</h3>
            <p className="font-semibold">₹{parseInt(policy.sumAssured || 0).toLocaleString()}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Policy Period</h3>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-blue-600" />
              <p>{new Date(policy.startDate).toLocaleDateString()} to {new Date(policy.endDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Premium</h3>
            <p>₹{parseInt(policy.premium || 0).toLocaleString()} ({policy.paymentFrequency})</p>
          </div>
        </div>
        
        <div className="mb-2">
          <h3 className="text-sm font-medium mb-2">Covered Members ({policy.members?.length || 0})</h3>
          {policy.members && policy.members.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {policy.members.map((member, index) => (
                <div key={member.memberId || index} className="bg-gray-50 p-3 rounded-md border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1 text-blue-600" />
                      <span className="font-medium">{member.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {member.relation}
                    </Badge>
                  </div>
                  <div className="text-xs space-y-1">
                    {member.age && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Age:</span> {member.age} years
                      </div>
                    )}
                    {member.dateOfBirth && (
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3 text-gray-500" /> 
                        {new Date(member.dateOfBirth).toLocaleDateString()}
                      </div>
                    )}
                    {member.gender && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Gender:</span> {member.gender}
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-500" /> {member.phone}
                      </div>
                    )}
                    {member.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-gray-500" /> {member.email}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-2 text-gray-500">No members added to this policy</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PolicyCard;
