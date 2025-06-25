
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Send, 
  Calendar,
  Filter,
  Search,
  Plus,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

const Communication = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock data for communications
  const communications = [
    {
      id: '1',
      type: 'email',
      subject: 'Policy Renewal Reminder',
      content: 'Your health insurance policy is due for renewal...',
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      status: 'sent',
      sentAt: '2024-06-25T10:30:00Z',
      deliveredAt: '2024-06-25T10:32:00Z',
      channel: 'email',
      priority: 'medium'
    },
    {
      id: '2',
      type: 'birthday',
      subject: 'Happy Birthday!',
      content: 'Wishing you a wonderful birthday...',
      clientName: 'Jane Smith',
      clientPhone: '+91-9876543210',
      status: 'delivered',
      sentAt: '2024-06-25T09:00:00Z',
      deliveredAt: '2024-06-25T09:01:00Z',
      channel: 'whatsapp',
      priority: 'low'
    },
    {
      id: '3',
      type: 'offer',
      subject: 'Special Discount on Health Insurance',
      content: 'Get 20% off on premium health insurance plans...',
      clientName: 'Robert Johnson',
      clientEmail: 'robert@example.com',
      status: 'pending',
      scheduledFor: '2024-06-26T14:00:00Z',
      channel: 'email',
      priority: 'high'
    }
  ];

  const filteredCommunications = useMemo(() => {
    return communications.filter(comm => {
      const matchesSearch = searchQuery === '' || 
        comm.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comm.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = activeTab === 'all' || comm.type === activeTab;
      const matchesStatus = statusFilter === 'all' || comm.status === statusFilter;
      const matchesType = typeFilter === 'all' || comm.channel === typeFilter;
      
      return matchesSearch && matchesTab && matchesStatus && matchesType;
    });
  }, [communications, searchQuery, activeTab, statusFilter, typeFilter]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4" />;
      case 'sms':
        return <Phone className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
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
    total: communications.length,
    sent: communications.filter(c => c.status === 'sent').length,
    delivered: communications.filter(c => c.status === 'delivered').length,
    pending: communications.filter(c => c.status === 'pending').length,
    failed: communications.filter(c => c.status === 'failed').length
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Communication Center</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Manage all client communications and broadcasts
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => navigate('/communication/create')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            New Communication
          </Button>
          <Button variant="outline" onClick={() => navigate('/communication/broadcast')}>
            <Send className="mr-2 h-4 w-4" />
            Create Broadcast
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total</p>
                <h3 className="text-2xl font-bold">{stats.total}</h3>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
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
              <Send className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Delivered</p>
                <h3 className="text-2xl font-bold">{stats.delivered}</h3>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <h3 className="text-2xl font-bold">{stats.pending}</h3>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Failed</p>
                <h3 className="text-2xl font-bold">{stats.failed}</h3>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
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
                  placeholder="Search communications..."
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
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="birthday">Birthday</TabsTrigger>
          <TabsTrigger value="offer">Offers</TabsTrigger>
          <TabsTrigger value="reminder">Reminders</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {/* Communications List */}
          <div className="space-y-4">
            {filteredCommunications.map((comm) => (
              <Card key={comm.id} className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/communication/${comm.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getChannelIcon(comm.channel)}
                        <h3 className="font-semibold text-lg">{comm.subject}</h3>
                        <Badge className={getPriorityColor(comm.priority)}>
                          {comm.priority}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2 line-clamp-2">{comm.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>To: {comm.clientName}</span>
                        <span>•</span>
                        <span>{comm.clientEmail || comm.clientPhone}</span>
                        <span>•</span>
                        <span>{comm.sentAt ? formatDate(comm.sentAt) : `Scheduled: ${formatDate(comm.scheduledFor)}`}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {getStatusIcon(comm.status)}
                      <Badge variant="outline">{comm.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCommunications.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No communications found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or create a new communication.</p>
                <Button onClick={() => navigate('/communication/create')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Communication
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Communication;
