
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Gift, 
  Star, 
  Calendar,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useCommunications, useLoyaltyStats, useCommunicationStats } from '@/hooks/useCommunication';

const CommunicationManager = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);

  // Fetch data from API
  const { data: communications = [], isLoading: commsLoading } = useCommunications({ limit: 10 });
  const { data: loyaltyStats, isLoading: loyaltyLoading } = useLoyaltyStats();
  const { data: stats, isLoading: statsLoading } = useCommunicationStats();

  const [communicationForm, setCommunicationForm] = useState({
    clientId: '',
    type: 'custom',
    channel: 'email',
    subject: '',
    content: '',
    scheduledFor: ''
  });

  const [offerForm, setOfferForm] = useState({
    title: '',
    description: '',
    type: 'discount',
    discountPercentage: '',
    applicableProducts: [],
    validFrom: '',
    validUntil: '',
    targetAllClients: true
  });

  const handleSendCommunication = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Communication sent successfully");
      setCommunicationForm({
        clientId: '',
        type: 'custom',
        channel: 'email',
        subject: '',
        content: '',
        scheduledFor: ''
      });
    } catch (error) {
      toast.error("Failed to send communication");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Offer created successfully");
      setOfferForm({
        title: '',
        description: '',
        type: 'discount',
        discountPercentage: '',
        applicableProducts: [],
        validFrom: '',
        validUntil: '',
        targetAllClients: true
      });
    } catch (error) {
      toast.error("Failed to create offer");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <MessageSquare className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-bold">Communication Manager</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="send">Send Message</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {(commsLoading || loyaltyLoading || statsLoading) ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sent Today</CardTitle>
                  <Send className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.sentToday || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.sentTodayChange ? `${stats.sentTodayChange > 0 ? '+' : ''}${stats.sentTodayChange}% from yesterday` : 'No change data'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.deliveryRate ? `${stats.deliveryRate}%` : '0%'}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.deliveryRateChange ? `${stats.deliveryRateChange > 0 ? '+' : ''}${stats.deliveryRateChange}% from last week` : 'No change data'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Birthday Greetings</CardTitle>
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.birthdayGreetings || 0}</div>
                  <p className="text-xs text-muted-foreground">Sent today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeOffers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.expiringOffers ? `${stats.expiringOffers} expiring soon` : 'No expiring offers'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recent Communications</CardTitle>
              <CardDescription>Latest sent communications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communications.map((comm) => (
                  <div key={comm.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getChannelIcon(comm.channel)}
                      <div>
                        <p className="font-medium">{comm.client}</p>
                        <p className="text-sm text-muted-foreground">{comm.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={comm.type === 'birthday' ? 'secondary' : 'default'}>
                        {comm.type}
                      </Badge>
                      {getStatusIcon(comm.status)}
                      <span className="text-sm text-muted-foreground">
                        {new Date(comm.sentAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Communication</CardTitle>
              <CardDescription>Send personalized messages to clients</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendCommunication} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Client</Label>
                    <Select value={communicationForm.clientId} onValueChange={(value) => 
                      setCommunicationForm({...communicationForm, clientId: value})
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">John Doe</SelectItem>
                        <SelectItem value="2">ABC Corp</SelectItem>
                        <SelectItem value="3">XYZ Group</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Communication Type</Label>
                    <Select value={communicationForm.type} onValueChange={(value) => 
                      setCommunicationForm({...communicationForm, type: value})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom</SelectItem>
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="anniversary">Anniversary</SelectItem>
                        <SelectItem value="offer">Offer</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="channel">Channel</Label>
                    <Select value={communicationForm.channel} onValueChange={(value) => 
                      setCommunicationForm({...communicationForm, channel: value})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scheduledFor">Schedule For (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={communicationForm.scheduledFor}
                      onChange={(e) => setCommunicationForm({...communicationForm, scheduledFor: e.target.value})}
                    />
                  </div>
                </div>

                {communicationForm.channel === 'email' && (
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      value={communicationForm.subject}
                      onChange={(e) => setCommunicationForm({...communicationForm, subject: e.target.value})}
                      placeholder="Enter email subject"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="content">Message Content</Label>
                  <Textarea
                    value={communicationForm.content}
                    onChange={(e) => setCommunicationForm({...communicationForm, content: e.target.value})}
                    placeholder="Enter your message..."
                    rows={6}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Sending..." : "Send Communication"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Offer</CardTitle>
              <CardDescription>Create targeted offers for clients</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOffer} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Offer Title</Label>
                    <Input
                      value={offerForm.title}
                      onChange={(e) => setOfferForm({...offerForm, title: e.target.value})}
                      placeholder="e.g., Summer Health Special"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Offer Type</Label>
                    <Select value={offerForm.type} onValueChange={(value) => 
                      setOfferForm({...offerForm, type: value})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discount">Discount</SelectItem>
                        <SelectItem value="cashback">Cashback</SelectItem>
                        <SelectItem value="bonus_points">Bonus Points</SelectItem>
                        <SelectItem value="free_addon">Free Add-on</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount Percentage</Label>
                    <Input
                      type="number"
                      value={offerForm.discountPercentage}
                      onChange={(e) => setOfferForm({...offerForm, discountPercentage: e.target.value})}
                      placeholder="e.g., 15"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="products">Applicable Products</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select products" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="life">Life Insurance</SelectItem>
                        <SelectItem value="health">Health Insurance</SelectItem>
                        <SelectItem value="auto">Auto Insurance</SelectItem>
                        <SelectItem value="home">Home Insurance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validFrom">Valid From</Label>
                    <Input
                      type="date"
                      value={offerForm.validFrom}
                      onChange={(e) => setOfferForm({...offerForm, validFrom: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input
                      type="date"
                      value={offerForm.validUntil}
                      onChange={(e) => setOfferForm({...offerForm, validUntil: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    value={offerForm.description}
                    onChange={(e) => setOfferForm({...offerForm, description: e.target.value})}
                    placeholder="Describe the offer details..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={offerForm.targetAllClients}
                    onCheckedChange={(checked) => setOfferForm({...offerForm, targetAllClients: checked})}
                  />
                  <Label>Target all clients</Label>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Creating..." : "Create Offer"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Object.entries(loyaltyStats).map(([tier, stats]) => (
              <Card key={tier}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium capitalize">{tier} Tier</CardTitle>
                  <Star className={`h-4 w-4 ${
                    tier === 'platinum' ? 'text-purple-500' :
                    tier === 'gold' ? 'text-yellow-500' :
                    tier === 'silver' ? 'text-gray-400' : 'text-orange-500'
                  }`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.count}</div>
                  <p className="text-xs text-muted-foreground">{stats.percentage}% of clients</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Loyalty Program Management</CardTitle>
              <CardDescription>Manage client loyalty points and tiers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Select Client</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Search clients..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">John Doe (Bronze)</SelectItem>
                        <SelectItem value="2">Jane Smith (Silver)</SelectItem>
                        <SelectItem value="3">ABC Corp (Gold)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="points">Points</Label>
                    <Input type="number" placeholder="Enter points" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="action">Action</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="earned">Add Points</SelectItem>
                        <SelectItem value="redeemed">Redeem Points</SelectItem>
                        <SelectItem value="adjusted">Adjust Points</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Input placeholder="e.g., Policy renewal, Special promotion" />
                </div>

                <Button className="w-full">Update Loyalty Points</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
              <CardDescription>Configure automated communication rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Birthday Greetings</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically send birthday wishes via email
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Active</Badge>
                    <Switch checked={true} />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Gift className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Anniversary Greetings</p>
                      <p className="text-sm text-muted-foreground">
                        Send anniversary wishes and special offers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Active</Badge>
                    <Switch checked={true} />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Policy Renewal Reminders</p>
                      <p className="text-sm text-muted-foreground">
                        Remind clients 30 days before policy expiry
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Active</Badge>
                    <Switch checked={true} />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Star className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium">Loyalty Points Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Notify clients when they earn or redeem points
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Inactive</Badge>
                    <Switch checked={false} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Performance</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Delivery Rate</span>
                    <span className="font-medium">97.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">WhatsApp Delivery Rate</span>
                    <span className="font-medium">95.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SMS Delivery Rate</span>
                    <span className="font-medium">98.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Response Time</span>
                    <span className="font-medium">2.3 hrs</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>Client interaction rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Open Rate</span>
                    <span className="font-medium">24.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Click-through Rate</span>
                    <span className="font-medium">3.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">WhatsApp Response Rate</span>
                    <span className="font-medium">18.7%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Offer Conversion Rate</span>
                    <span className="font-medium">8.9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Communication Trends</CardTitle>
              <CardDescription>
                <TrendingUp className="h-4 w-4 inline mr-1" />
                Monthly communication volume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Chart placeholder - Integration with your preferred charting library
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationManager;
