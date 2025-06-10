
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, Mail, MessageSquare, Filter } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useUpdateClientPreferences } from '@/hooks/useBroadcast';

const ClientOptInManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: clientsData, isLoading } = useClients({ 
    page: currentPage, 
    limit: 10,
    search: searchTerm,
    type: filterType !== 'all' ? filterType : undefined
  });

  const updatePreferences = useUpdateClientPreferences();

  const handlePreferenceChange = async (clientId, channel, type, value) => {
    try {
      await updatePreferences.mutateAsync({
        clientId,
        preferences: {
          channel,
          type,
          optIn: value
        }
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const getPreferenceValue = (client, channel, type) => {
    return client.communicationPreferences?.[channel]?.[type] !== false;
  };

  const filteredClients = clientsData?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filterType === 'individual' ? 'default' : 'outline'}
            onClick={() => setFilterType('individual')}
            size="sm"
          >
            Individual
          </Button>
          <Button
            variant={filterType === 'corporate' ? 'default' : 'outline'}
            onClick={() => setFilterType('corporate')}
            size="sm"
          >
            Corporate
          </Button>
          <Button
            variant={filterType === 'group' ? 'default' : 'outline'}
            onClick={() => setFilterType('group')}
            size="sm"
          >
            Group
          </Button>
        </div>
      </div>

      {/* Client List */}
      <div className="space-y-4">
        {filteredClients.map((client) => (
          <Card key={client._id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{client.displayName}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {client.email} • {client.phone}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{client.clientType}</Badge>
                  <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>
                    {client.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Preferences */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <Label className="font-medium">Email Communications</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`email-offers-${client._id}`} className="text-sm">
                        Offers & Promotions
                      </Label>
                      <Switch
                        id={`email-offers-${client._id}`}
                        checked={getPreferenceValue(client, 'email', 'offers')}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange(client._id, 'email', 'offers', checked)
                        }
                        disabled={updatePreferences.isPending}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`email-newsletters-${client._id}`} className="text-sm">
                        Newsletters
                      </Label>
                      <Switch
                        id={`email-newsletters-${client._id}`}
                        checked={getPreferenceValue(client, 'email', 'newsletters')}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange(client._id, 'email', 'newsletters', checked)
                        }
                        disabled={updatePreferences.isPending}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`email-reminders-${client._id}`} className="text-sm">
                        Reminders
                      </Label>
                      <Switch
                        id={`email-reminders-${client._id}`}
                        checked={getPreferenceValue(client, 'email', 'reminders')}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange(client._id, 'email', 'reminders', checked)
                        }
                        disabled={updatePreferences.isPending}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`email-birthday-${client._id}`} className="text-sm">
                        Birthday Greetings
                      </Label>
                      <Switch
                        id={`email-birthday-${client._id}`}
                        checked={getPreferenceValue(client, 'email', 'birthday')}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange(client._id, 'email', 'birthday', checked)
                        }
                        disabled={updatePreferences.isPending}
                      />
                    </div>
                  </div>
                </div>

                {/* WhatsApp Preferences */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <Label className="font-medium">WhatsApp Communications</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`whatsapp-offers-${client._id}`} className="text-sm">
                        Offers & Promotions
                      </Label>
                      <Switch
                        id={`whatsapp-offers-${client._id}`}
                        checked={getPreferenceValue(client, 'whatsapp', 'offers')}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange(client._id, 'whatsapp', 'offers', checked)
                        }
                        disabled={updatePreferences.isPending}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`whatsapp-newsletters-${client._id}`} className="text-sm">
                        Newsletters
                      </Label>
                      <Switch
                        id={`whatsapp-newsletters-${client._id}`}
                        checked={getPreferenceValue(client, 'whatsapp', 'newsletters')}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange(client._id, 'whatsapp', 'newsletters', checked)
                        }
                        disabled={updatePreferences.isPending}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`whatsapp-reminders-${client._id}`} className="text-sm">
                        Reminders
                      </Label>
                      <Switch
                        id={`whatsapp-reminders-${client._id}`}
                        checked={getPreferenceValue(client, 'whatsapp', 'reminders')}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange(client._id, 'whatsapp', 'reminders', checked)
                        }
                        disabled={updatePreferences.isPending}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`whatsapp-birthday-${client._id}`} className="text-sm">
                        Birthday Greetings
                      </Label>
                      <Switch
                        id={`whatsapp-birthday-${client._id}`}
                        checked={getPreferenceValue(client, 'whatsapp', 'birthday')}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange(client._id, 'whatsapp', 'birthday', checked)
                        }
                        disabled={updatePreferences.isPending}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreferenceChange(client._id, 'email', 'all', true)}
                  disabled={updatePreferences.isPending}
                >
                  Enable All Email
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreferenceChange(client._id, 'whatsapp', 'all', true)}
                  disabled={updatePreferences.isPending}
                >
                  Enable All WhatsApp
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreferenceChange(client._id, 'email', 'all', false)}
                  disabled={updatePreferences.isPending}
                >
                  Disable All Email
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreferenceChange(client._id, 'whatsapp', 'all', false)}
                  disabled={updatePreferences.isPending}
                >
                  Disable All WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {clientsData?.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {clientsData.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, clientsData.totalPages))}
            disabled={currentPage === clientsData.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ClientOptInManager;
