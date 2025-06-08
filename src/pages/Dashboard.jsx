
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from '../components/layout/Header';
import { 
  Users, 
  FileText, 
  AlertCircle, 
  UserPlus, 
  Calculator,
  TrendingUp,
  Calendar,
  MessageSquare,
  Mail,
  Gift
} from 'lucide-react';

const Dashboard = () => {
  // Mock data for demonstration
  const stats = {
    totalClients: 1250,
    activePolicies: 890,
    pendingClaims: 23,
    newLeads: 45,
    quotations: 12
  };

  const recentActivities = [
    { id: 1, type: 'claim', description: 'New claim submitted by John Doe', time: '2 hours ago' },
    { id: 2, type: 'policy', description: 'Policy renewed for ABC Corp', time: '4 hours ago' },
    { id: 3, type: 'lead', description: 'New lead from website form', time: '6 hours ago' },
    { id: 4, type: 'client', description: 'Client information updated', time: '1 day ago' }
  ];

  const communicationStats = {
    sentToday: 24,
    deliveryRate: 96.5,
    birthdayGreetings: 8,
    activeOffers: 5
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600">Here's what's happening with your insurance business today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePolicies.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingClaims}</div>
              <p className="text-xs text-muted-foreground">-2 from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newLeads}</div>
              <p className="text-xs text-muted-foreground">+15% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quotations</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.quotations}</div>
              <p className="text-xs text-muted-foreground">+3 today</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Communication Overview */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Communication
                </CardTitle>
                <CardDescription>Automated client communications</CardDescription>
              </div>
              <Link to="/communication">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sent Today</span>
                <span className="font-medium">{communicationStats.sentToday}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Delivery Rate</span>
                <span className="font-medium">{communicationStats.deliveryRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Gift className="h-3 w-3" />
                  Birthday Greetings
                </span>
                <span className="font-medium">{communicationStats.birthdayGreetings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Offers</span>
                <Badge variant="secondary">{communicationStats.activeOffers}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest updates from your team</CardDescription>
              </div>
              <Link to="/activities">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {activity.type === 'claim' && <AlertCircle className="h-5 w-5 text-orange-500" />}
                      {activity.type === 'policy' && <FileText className="h-5 w-5 text-blue-500" />}
                      {activity.type === 'lead' && <UserPlus className="h-5 w-5 text-green-500" />}
                      {activity.type === 'client' && <Users className="h-5 w-5 text-purple-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Link to="/clients">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <Users className="h-6 w-6" />
                    <span className="text-xs">Add Client</span>
                  </Button>
                </Link>
                
                <Link to="/policies">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <FileText className="h-6 w-6" />
                    <span className="text-xs">New Policy</span>
                  </Button>
                </Link>
                
                <Link to="/claims">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <AlertCircle className="h-6 w-6" />
                    <span className="text-xs">File Claim</span>
                  </Button>
                </Link>
                
                <Link to="/quotations">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <Calculator className="h-6 w-6" />
                    <span className="text-xs">Create Quote</span>
                  </Button>
                </Link>
                
                <Link to="/communication">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <Mail className="h-6 w-6" />
                    <span className="text-xs">Send Message</span>
                  </Button>
                </Link>
                
                <Link to="/activities">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <Calendar className="h-6 w-6" />
                    <span className="text-xs">View Calendar</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
