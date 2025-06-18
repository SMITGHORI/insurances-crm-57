
const Client = require('../models/Client');
const Activity = require('../models/Activity');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Dashboard Controller with real-time data aggregation
 * Includes role-based filtering and cross-module integration
 */

// Get dashboard overview with role-based data
exports.getDashboardOverview = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    
    // Build role-based filter
    let clientFilter = {};
    let generalFilter = {};
    
    if (role === 'agent') {
      clientFilter.assignedAgentId = new mongoose.Types.ObjectId(userId);
      generalFilter.assignedAgentId = new mongoose.Types.ObjectId(userId);
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      const objectIds = agentIds.map(id => new mongoose.Types.ObjectId(id));
      clientFilter.assignedAgentId = { $in: objectIds };
      generalFilter.assignedAgentId = { $in: objectIds };
    }

    // Get clients overview
    const clientsOverview = await Client.aggregate([
      { $match: clientFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ['$status', 'Inactive'] }, 1, 0] } }
        }
      }
    ]);

    // Calculate client growth trend (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [recentClients, previousClients] = await Promise.all([
      Client.countDocuments({ ...clientFilter, createdAt: { $gte: thirtyDaysAgo } }),
      Client.countDocuments({ 
        ...clientFilter, 
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } 
      })
    ]);

    const clientTrend = previousClients > 0 
      ? (((recentClients - previousClients) / previousClients) * 100).toFixed(1)
      : recentClients > 0 ? '+100' : '0';

    // Mock data for other modules (to be replaced with actual models)
    const overview = {
      clients: {
        total: clientsOverview[0]?.total || 0,
        active: clientsOverview[0]?.active || 0,
        pending: clientsOverview[0]?.pending || 0,
        trend: clientTrend
      },
      policies: {
        total: Math.floor(Math.random() * 500) + 100, // Mock data
        active: Math.floor(Math.random() * 400) + 80,
        expiring: Math.floor(Math.random() * 20) + 5,
        trend: '+12.3'
      },
      claims: {
        total: Math.floor(Math.random() * 100) + 20,
        pending: Math.floor(Math.random() * 30) + 5,
        approved: Math.floor(Math.random() * 60) + 10,
        trend: '-8.1'
      },
      leads: {
        total: Math.floor(Math.random() * 200) + 50,
        active: Math.floor(Math.random() * 150) + 30,
        converted: Math.floor(Math.random() * 80) + 20,
        conversionRate: '24.5',
        trend: '+18.7'
      },
      quotations: {
        total: Math.floor(Math.random() * 300) + 75,
        pending: Math.floor(Math.random() * 100) + 25,
        approved: Math.floor(Math.random() * 150) + 40,
        conversionRate: '28.3',
        trend: '+15.2'
      }
    };

    res.status(200).json({
      success: true,
      data: overview
    });

  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard overview',
      error: error.message
    });
  }
};

// Get recent activities with role-based filtering
exports.getRecentActivities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const { role, _id: userId } = req.user;

    let activityFilter = {};
    
    if (role === 'agent') {
      activityFilter.userId = userId;
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      activityFilter.userId = { $in: agentIds };
    }

    const activities = await Activity.find(activityFilter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'firstName lastName')
      .populate('performedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities',
      error: error.message
    });
  }
};

// Get performance metrics
exports.getPerformanceMetrics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const { role, _id: userId } = req.user;

    // Calculate date range
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let clientFilter = {};
    if (role === 'agent') {
      clientFilter.assignedAgentId = userId;
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      clientFilter.assignedAgentId = { $in: agentIds };
    }

    // Get client metrics
    const [newClients, totalClients] = await Promise.all([
      Client.countDocuments({ 
        ...clientFilter, 
        createdAt: { $gte: startDate } 
      }),
      Client.countDocuments(clientFilter)
    ]);

    // Mock metrics for other modules
    const metrics = {
      newClients,
      totalClients,
      newPolicies: Math.floor(Math.random() * 50) + 10,
      totalRevenue: (Math.random() * 100000 + 25000).toFixed(0),
      averageDealSize: (Math.random() * 5000 + 2000).toFixed(0),
      conversionRate: ((Math.random() * 20) + 15).toFixed(1),
      customerSatisfaction: ((Math.random() * 10) + 85).toFixed(1)
    };

    res.status(200).json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance metrics',
      error: error.message
    });
  }
};

// Get charts data for visualization
exports.getChartsData = async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    const { role, _id: userId } = req.user;

    let clientFilter = {};
    if (role === 'agent') {
      clientFilter.assignedAgentId = new mongoose.Types.ObjectId(userId);
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      clientFilter.assignedAgentId = { $in: agentIds.map(id => new mongoose.Types.ObjectId(id)) };
    }

    // Get real client data for charts
    const clientTypeData = await Client.aggregate([
      { $match: clientFilter },
      {
        $group: {
          _id: '$clientType',
          count: { $sum: 1 }
        }
      }
    ]);

    const clientStatusData = await Client.aggregate([
      { $match: clientFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Generate monthly revenue data (mock)
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: Math.floor(Math.random() * 50000) + 20000,
        policies: Math.floor(Math.random() * 30) + 10
      };
    }).reverse();

    const chartsData = {
      revenue: monthlyRevenue,
      leadsFunnel: [
        { name: 'New Leads', count: Math.floor(Math.random() * 100) + 50 },
        { name: 'Qualified', count: Math.floor(Math.random() * 60) + 30 },
        { name: 'Proposal', count: Math.floor(Math.random() * 40) + 20 },
        { name: 'Closed', count: Math.floor(Math.random() * 25) + 10 }
      ],
      claimsStatus: clientStatusData.map(item => ({
        status: item._id,
        count: item.count
      })),
      clientTypes: clientTypeData.map(item => ({
        type: item._id,
        count: item.count
      }))
    };

    res.status(200).json({
      success: true,
      data: chartsData
    });

  } catch (error) {
    console.error('Error fetching charts data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch charts data',
      error: error.message
    });
  }
};

// Get quick actions data
exports.getQuickActions = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;

    let clientFilter = {};
    if (role === 'agent') {
      clientFilter.assignedAgentId = userId;
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      clientFilter.assignedAgentId = { $in: agentIds };
    }

    // Get pending clients
    const pendingClients = await Client.find({ 
      ...clientFilter, 
      status: 'Pending' 
    }).limit(5).select('_id clientId email phone');

    // Mock data for other modules
    const quickActions = {
      pendingClaims: {
        count: Math.floor(Math.random() * 10) + 2,
        items: Array.from({ length: 3 }, (_, i) => ({
          claimId: `CLM${String(i + 1).padStart(3, '0')}`,
          claimAmount: (Math.random() * 50000 + 10000).toFixed(0)
        }))
      },
      expiringPolicies: {
        count: Math.floor(Math.random() * 8) + 1,
        items: Array.from({ length: 2 }, (_, i) => ({
          policyNumber: `POL${String(i + 1).padStart(4, '0')}`,
          premium: (Math.random() * 20000 + 5000).toFixed(0)
        }))
      },
      overdueLeads: {
        count: Math.floor(Math.random() * 15) + 3,
        items: Array.from({ length: 2 }, (_, i) => ({
          name: `Lead ${i + 1}`,
          email: `lead${i + 1}@email.com`
        }))
      },
      pendingQuotations: {
        count: Math.floor(Math.random() * 12) + 2,
        items: Array.from({ length: 2 }, (_, i) => ({
          quotationId: `QUO${String(i + 1).padStart(3, '0')}`,
          premiumAmount: (Math.random() * 15000 + 3000).toFixed(0)
        }))
      },
      pendingClients: {
        count: pendingClients.length,
        items: pendingClients.map(client => ({
          clientId: client.clientId,
          email: client.email,
          phone: client.phone
        }))
      }
    };

    res.status(200).json({
      success: true,
      data: quickActions
    });

  } catch (error) {
    console.error('Error fetching quick actions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quick actions',
      error: error.message
    });
  }
};

// Refresh dashboard data
exports.refreshDashboard = async (req, res) => {
  try {
    // This endpoint can be used to trigger cache refresh or data recalculation
    const { role, _id: userId } = req.user;

    // Log refresh activity
    await Activity.logActivity({
      action: 'Refreshed dashboard',
      type: 'user',
      operation: 'read',
      description: 'User refreshed dashboard data',
      entityType: 'Dashboard',
      entityId: userId,
      entityName: 'Dashboard',
      userId: userId,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: role,
      performedBy: userId
    });

    res.status(200).json({
      success: true,
      message: 'Dashboard data refreshed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error refreshing dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh dashboard',
      error: error.message
    });
  }
};
