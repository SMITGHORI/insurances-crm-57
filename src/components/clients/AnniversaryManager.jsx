
import React, { useState } from 'react';
import { Calendar, Gift, Heart, Building, Users, Send, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const AnniversaryManager = ({ client }) => {
  const [sendingGreeting, setSendingGreeting] = useState(null);

  // Get anniversaries based on client type and data
  const getClientAnniversaries = () => {
    const anniversaries = [];
    const currentYear = new Date().getFullYear();

    // Birthday (for individual clients)
    if (client.type === 'Individual' && client.dob) {
      const birthday = new Date(client.dob);
      const thisYearBirthday = new Date(currentYear, birthday.getMonth(), birthday.getDate());
      anniversaries.push({
        id: 'birthday',
        type: 'Birthday',
        date: thisYearBirthday,
        originalDate: client.dob,
        icon: <Gift className="h-4 w-4 text-pink-500" />,
        color: 'bg-pink-100 text-pink-800',
        description: `${client.name}'s Birthday`
      });
    }

    // Marriage Anniversary (for individual clients)
    if (client.type === 'Individual' && client.importantDates?.marriageAnniversary) {
      const marriageDate = new Date(client.importantDates.marriageAnniversary);
      const thisYearAnniversary = new Date(currentYear, marriageDate.getMonth(), marriageDate.getDate());
      const yearsMarried = currentYear - marriageDate.getFullYear();
      anniversaries.push({
        id: 'marriage',
        type: 'Marriage Anniversary',
        date: thisYearAnniversary,
        originalDate: client.importantDates.marriageAnniversary,
        icon: <Heart className="h-4 w-4 text-red-500" />,
        color: 'bg-red-100 text-red-800',
        description: `${yearsMarried} years of marriage`
      });
    }

    // Incorporation Anniversary (for corporate clients)
    if (client.type === 'Corporate' && client.importantDates?.incorporationDate) {
      const incorpDate = new Date(client.importantDates.incorporationDate);
      const thisYearAnniversary = new Date(currentYear, incorpDate.getMonth(), incorpDate.getDate());
      const yearsInBusiness = currentYear - incorpDate.getFullYear();
      anniversaries.push({
        id: 'incorporation',
        type: 'Incorporation Anniversary',
        date: thisYearAnniversary,
        originalDate: client.importantDates.incorporationDate,
        icon: <Building className="h-4 w-4 text-blue-500" />,
        color: 'bg-blue-100 text-blue-800',
        description: `${yearsInBusiness} years in business`
      });
    }

    // Group Anniversary (for group clients)
    if (client.type === 'Group' && client.importantDates?.groupAnniversary) {
      const groupDate = new Date(client.importantDates.groupAnniversary);
      const thisYearAnniversary = new Date(currentYear, groupDate.getMonth(), groupDate.getDate());
      const yearsActive = currentYear - groupDate.getFullYear();
      anniversaries.push({
        id: 'group',
        type: 'Group Anniversary',
        date: thisYearAnniversary,
        originalDate: client.importantDates.groupAnniversary,
        icon: <Users className="h-4 w-4 text-green-500" />,
        color: 'bg-green-100 text-green-800',
        description: `${yearsActive} years as a group`
      });
    }

    // Policy Anniversaries (mock data for now)
    const mockPolicyDate = new Date('2023-03-15');
    const thisPolicyAnniversary = new Date(currentYear, mockPolicyDate.getMonth(), mockPolicyDate.getDate());
    anniversaries.push({
      id: 'policy-1',
      type: 'Policy Anniversary',
      date: thisPolicyAnniversary,
      originalDate: '2023-03-15',
      icon: <Calendar className="h-4 w-4 text-purple-500" />,
      color: 'bg-purple-100 text-purple-800',
      description: 'Health Insurance Policy'
    });

    return anniversaries.sort((a, b) => a.date - b.date);
  };

  const getDaysUntilAnniversary = (date) => {
    const today = new Date();
    const timeDiff = date.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) {
      // Anniversary has passed this year, calculate for next year
      const nextYear = new Date(date);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const nextTimeDiff = nextYear.getTime() - today.getTime();
      return Math.ceil(nextTimeDiff / (1000 * 3600 * 24));
    }
    return daysDiff;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPreferredChannels = () => {
    const channels = [];
    if (client.communicationPreferences?.email?.enabled && client.communicationPreferences?.email?.anniversary) {
      channels.push('Email');
    }
    if (client.communicationPreferences?.whatsapp?.enabled && client.communicationPreferences?.whatsapp?.anniversary) {
      channels.push('WhatsApp');
    }
    if (client.communicationPreferences?.sms?.enabled && client.communicationPreferences?.sms?.anniversary) {
      channels.push('SMS');
    }
    return channels.length > 0 ? channels : ['Email']; // Default to email if no preferences set
  };

  const handleSendGreeting = async (anniversary) => {
    setSendingGreeting(anniversary.id);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success(`${anniversary.type} greeting sent successfully via ${getPreferredChannels().join(' & ')}!`);
    setSendingGreeting(null);
  };

  // Mock communication history
  const communicationHistory = [
    {
      id: 1,
      type: 'Birthday',
      date: '2024-06-15',
      channel: 'Email + WhatsApp',
      status: 'Delivered',
      message: 'Happy Birthday! Wishing you a wonderful year ahead.'
    },
    {
      id: 2,
      type: 'Marriage Anniversary',
      date: '2024-05-20',
      channel: 'Email',
      status: 'Delivered',
      message: 'Happy Anniversary! Celebrating your special day with you.'
    },
    {
      id: 3,
      type: 'Policy Anniversary',
      date: '2024-03-15',
      channel: 'WhatsApp',
      status: 'Delivered',
      message: 'Thank you for being our valued customer for another year!'
    }
  ];

  const anniversaries = getClientAnniversaries();

  return (
    <div className="space-y-6">
      {/* Client Communication Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Communication Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {getPreferredChannels().map((channel) => (
              <Badge key={channel} variant="outline" className="bg-green-50 text-green-700">
                {channel}
              </Badge>
            ))}
            {getPreferredChannels().length === 0 && (
              <Badge variant="outline" className="bg-gray-50 text-gray-700">
                No preferences set
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Anniversaries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Anniversaries</CardTitle>
        </CardHeader>
        <CardContent>
          {anniversaries.length > 0 ? (
            <div className="space-y-4">
              {anniversaries.map((anniversary) => {
                const daysUntil = getDaysUntilAnniversary(anniversary.date);
                const isToday = daysUntil === 0;
                const isUpcoming = daysUntil <= 30;

                return (
                  <div key={anniversary.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {anniversary.icon}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{anniversary.type}</h4>
                          <Badge className={anniversary.color}>
                            {isToday ? 'Today!' : `${daysUntil} days`}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{anniversary.description}</p>
                        <p className="text-xs text-gray-400">{formatDate(anniversary.date)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {(isToday || isUpcoming) && (
                        <Button
                          size="sm"
                          onClick={() => handleSendGreeting(anniversary)}
                          disabled={sendingGreeting === anniversary.id}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {sendingGreeting === anniversary.id ? (
                            <>
                              <Clock className="h-4 w-4 mr-1 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-1" />
                              Send Greeting
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No anniversary dates available for this client</p>
              <p className="text-sm">Add important dates in client profile to track anniversaries</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Communication History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Communication History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {communicationHistory.map((comm) => (
              <div key={comm.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{comm.type} - {comm.date}</p>
                    <p className="text-xs text-gray-500">via {comm.channel}</p>
                    <p className="text-xs text-gray-600 mt-1">{comm.message}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {comm.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnniversaryManager;
