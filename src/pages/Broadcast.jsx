
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Megaphone, 
  Send, 
  Users, 
  Calendar,
  Plus,
  Search,
  Filter,
  Mail,
  MessageSquare,
  Phone,
  TrendingUp,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

const Broadcast = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock data for broadcasts
  const broadcasts = [
    {
      id: '1',
      title: 'Diwali Special Offers',
      description: 'Festival greetings with special insurance offers',
      type: 'festival',
      channels: ['email', 'whatsapp'],
      status: 'sent',
      totalRecipients: 1250,
      sentCount: 1245,
      deliveredCount: 1180,
      failedCount: 65,
      scheduledAt: '2024-06-20T09:00:00Z',
      sentAt: '2024-06-20T09:00:00Z',
      createdBy: 'Agent Smith'
    },
    {
      id: '2',
      title: 'Health Insurance Premium Due',
      description: 'Reminder for premium payment due dates',
      type: 'reminder',
      channels: ['email'],
      status: 'scheduled',
      totalRecipients: 890,
      scheduledAt: '2024-06-26T10:00:00Z',
      createdBy: 'Manager John'
    },
    {
      id: '3',
      title: 'Summer Health Checkup Discount',
      description: '25% off on annual health checkup packages',
      type: 'offer',
      channels: ['email', 'whatsapp', 'sms'],
      status: 'draft',
      totalRecipients: 0,
      createdBy: 'Agent Mary'
    }
  ];

  const filteredBroadcasts = useMemo(() => {
    return broadcasts.filter(broadcast => {
      const matchesSearch = searchQuery === '' || 
        broadcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        broadcast.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || broadcast.status === statusFilter;
      const matchesType = typeFilter === 'all' || broadcast.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [broadcasts, searchQuery, statusFilter, typeFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'offer':
        return 'bg-purple-100 text-purple-800';
      case 'festival':
        return 'bg-orange-100 text-orange-800';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800';
      case 'announcement':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: broadcasts.length,
    sent: broadcasts.filter(b => b.status === 'sent').length,
    scheduled: broadcasts.filter(b => b.status === 'scheduled').length,
    draft: broadcasts.filter(b => b.status === 'draft').length,
    totalRecipients: broadcasts.reduce((sum, b) => sum + (b.totalRecipients || 0), 0)
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Broadcast Center</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Create and manage mass communications
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => navigate('/broadcast/create')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Broadcast
          </Button>
          <Button variant="outline" onClick={() => navigate('/broadcast/analytics')}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Broadcasts</p>
                <h3 className="text-2xl font-bold">{stats.total}</h3>
              </div>
              <Megaphone className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Sent</p>
                <h3 className="text-2xl font-bold">{stats.sent}</h3>
              </div>
              <Send className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Scheduled</p>
                <h3 className="text-2xl font-bold">{stats.scheduled}</h3>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Drafts</p>
                <h3 className="text-2xl font-bold">{stats.draft}</h3>
              </div>
              <Edit className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Reach</p>
                <h3 className="text-2xl font-bold">{stats.totalRecipients.toLocaleString()}</h3>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search broadcasts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sending">Sending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="offer">Offers</SelectItem>
                <SelectItem value="festival">Festival</SelectItem>
                <SelectItem value="reminder">Reminders</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Broadcasts List */}
      <div className="space-y-4">
        {filteredBroadcasts.map((broadcast) => (
          <Card key={broadcast.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{broadcast.title}</h3>
                    <Badge className={getStatusColor(broadcast.status)}>
                      {broadcast.status}
                    </Badge>
                    <Badge className={getTypeColor(broadcast.type)}>
                      {broadcast.type}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{broadcast.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{broadcast.totalRecipients || 0} recipients</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Channels:</span>
                      {broadcast.channels.map((channel, index) => (
                        <span key={index} className="flex items-center">
                          {channel === 'email' && <Mail className="h-4 w-4" />}
                          {channel === 'whatsapp' && <MessageSquare className="h-4 w-4" />}
                          {channel === 'sms' && <Phone className="h-4 w-4" />}
                        </span>
                      ))}
                    </div>
                    <span>By: {broadcast.createdBy}</span>
                  </div>

                  {broadcast.status === 'sent' && (
                    <div className="flex gap-6 text-sm">
                      <span className="text-green-600">✓ Sent: {broadcast.sentCount}</span>
                      <span className="text-blue-600">✓ Delivered: {broadcast.deliveredCount}</span>
                      <span className="text-red-600">✗ Failed: {broadcast.failedCount}</span>
                    </div>
                  )}

                  <div className="text-sm text-gray-500 mt-2">
                    {broadcast.status === 'scheduled' ? 
                      `Scheduled: ${formatDate(broadcast.scheduledAt)}` :
                      broadcast.sentAt ? `Sent: ${formatDate(broadcast.sentAt)}` : 'Draft'
                    }
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/broadcast/${broadcast.id}`)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/broadcast/${broadcast.id}/edit`)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {broadcast.status === 'draft' && (
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBroadcasts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No broadcasts found</h3>
            <p className="text-gray-600 mb-4">Create your first broadcast to reach multiple clients at once.</p>
            <Button onClick={() => navigate('/broadcast/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Broadcast
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Broadcast;
