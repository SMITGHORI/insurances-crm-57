
const User = require('../models/User');
const Client = require('../models/Client');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const Lead = require('../models/Lead');
const Quotation = require('../models/Quotation');
const Agent = require('../models/Agent');
const Activity = require('../models/Activity');
const { AppError } = require('../utils/errorHandler');
const { successResponse } = require('../utils/responseHandler');

/**
 * Get dashboard overview stats with role-based filtering
 */
const getDashboardOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Build role-based filter
    let filter = {};
    if (userRole === 'agent') {
      filter = { assignedAgentId: userId };
    } else if (userRole === 'manager') {
      // Get team members for manager
      const teamMembers = await User.find({ role: 'agent' }).select('_id');
      const teamIds = teamMembers.map(member => member._id);
      teamIds.push(userId);
      filter = { assignedAgentId: { $in: teamIds } };
    }
    // Super admin sees everything (no filter)

    // Get real-time counts
    const [
      clientStats,
      policyStats,
      claimStats,
      leadStats,
      quotationStats
    ] = await Promise.all([
      Client.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } }
          }
        }
      ]),
      Policy.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
          }
        }
      ]),
      Claim.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $in: ['$status', ['reported', 'under_review']] }, 1, 0] } }
          }
        }
      ]),
      Lead.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $in: ['$status', ['new', 'contacted', 'qualified']] }, 1, 0] } }
          }
        }
      ]),
      Quotation.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $in: ['$status', ['draft', 'sent']] }, 1, 0] } }
          }
        }
      ])
    ]);

    // Calculate trends (comparing with last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [
      recentClients,
      recentPolicies,
      recentClaims,
      recentLeads,
      recentQuotations
    ] = await Promise.all([
      Client.countDocuments({ ...filter, createdAt: { $gte: thirtyDaysAgo } }),
      Policy.countDocuments({ ...filter, createdAt: { $gte: thirtyDaysAgo } }),
      Claim.countDocuments({ ...filter, createdAt: { $gte: thirtyDaysAgo } }),
      Lead.countDocuments({ ...filter, createdAt: { $gte: thirtyDaysAgo } }),
      Quotation.countDocuments({ ...filter, createdAt: { $gte: thirtyDaysAgo } })
    ]);

    // Calculate conversion rates
    const totalLeads = leadStats[0]?.total || 0;
    const totalPolicies = policyStats[0]?.total || 0;
    const totalQuotations = quotationStats[0]?.total || 0;
    
    const leadConversionRate = totalLeads > 0 ? ((totalPolicies / totalLeads) * 100).toFixed(2) : '0';
    const quotationConversionRate = totalQuotations > 0 ? ((totalPolicies / totalQuotations) * 100).toFixed(2) : '0';

    const overview = {
      clients: {
        total: clientStats[0]?.total || 0,
        active: clientStats[0]?.active || 0,
        trend: recentClients > 0 ? `+${recentClients}` : '0'
      },
      policies: {
        total: policyStats[0]?.total || 0,
        active: policyStats[0]?.active || 0,
        trend: recentPolicies > 0 ? `+${recentPolicies}` : '0'
      },
      claims: {
        total: claimStats[0]?.total || 0,
        pending: claimStats[0]?.pending || 0,
        trend: recentClaims > 0 ? `+${recentClaims}` : '0'
      },
      leads: {
        total: totalLeads,
        active: leadStats[0]?.active || 0,
        conversionRate: leadConversionRate,
        trend: recentLeads > 0 ? `+${recentLeads}` : '0'
      },
      quotations: {
        total: totalQuotations,
        pending: quotationStats[0]?.pending || 0,
        conversionRate: quotationConversionRate,
        trend: recentQuotations > 0 ? `+${recentQuotations}` : '0'
      }
    };
    
    successResponse(res, overview, 'Dashboard overview retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent activities with role-based filtering
 */
const getRecentActivities = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { limit = 10 } = req.query;
    
    let filter = {};
    if (userRole === 'agent') {
      filter = { userId: userId };
    } else if (userRole === 'manager') {
      const teamMembers = await User.find({ role: 'agent' }).select('_id');
      const teamIds = teamMembers.map(member => member._id);
      teamIds.push(userId);
      filter = { userId: { $in: teamIds } };
    }
    
    const activities = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('performedBy', 'name email')
      .populate('relatedClient', 'firstName lastName email')
      .lean();
    
    successResponse(res, activities, 'Recent activities retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get performance metrics with real-time calculations
 */
const getPerformanceMetrics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    let filter = {};
    if (userRole === 'agent') {
      filter = { assignedAgentId: userId };
    } else if (userRole === 'manager') {
      const teamMembers = await User.find({ role: 'agent' }).select('_id');
      const teamIds = teamMembers.map(member => member._id);
      teamIds.push(userId);
      filter = { assignedAgentId: { $in: teamIds } };
    }
    
    const dateFilter = { createdAt: { $gte: startDate, $lte: now } };
    
    // Get real metrics
    const [
      newClients,
      newPolicies,
      newClaims,
      newLeads,
      revenueData
    ] = await Promise.all([
      Client.countDocuments({ ...filter, ...dateFilter }),
      Policy.countDocuments({ ...filter, ...dateFilter }),
      Claim.countDocuments({ ...filter, ...dateFilter }),
      Lead.countDocuments({ ...filter, ...dateFilter }),
      Policy.aggregate([
        { $match: { ...filter, ...dateFilter } },
        { $group: { _id: null, total: { $sum: '$premium.amount' } } }
      ])
    ]);
    
    const totalRevenue = revenueData[0]?.total || 0;
    const averageDealSize = newPolicies > 0 ? (totalRevenue / newPolicies).toFixed(2) : '0.00';
    
    const metrics = {
      period,
      newClients,
      newPolicies,
      newClaims,
      newLeads,
      totalRevenue,
      averageDealSize
    };
    
    successResponse(res, metrics, 'Performance metrics retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get real-time charts data
 */
const getChartsData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { type = 'all' } = req.query;
    
    let filter = {};
    if (userRole === 'agent') {
      filter = { assignedAgentId: userId };
    } else if (userRole === 'manager') {
      const teamMembers = await User.find({ role: 'agent' }).select('_id');
      const teamIds = teamMembers.map(member => member._id);
      teamIds.push(userId);
      filter = { assignedAgentId: { $in: teamIds } };
    }
    
    const chartsData = {};
    
    if (type === 'all' || type === 'revenue') {
      // Revenue chart - last 12 months
      const revenueData = await Policy.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$premium.amount' },
            policies: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ]);
      
      chartsData.revenue = revenueData.map(item => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        revenue: item.revenue,
        policies: item.policies
      }));
    }
    
    if (type === 'all' || type === 'leads') {
      // Leads funnel
      const leadsData = await Lead.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      chartsData.leadsFunnel = leadsData.map(item => ({
        status: item._id,
        count: item.count
      }));
    }
    
    if (type === 'all' || type === 'claims') {
      // Claims status distribution
      const claimsData = await Claim.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            amount: { $sum: '$claimAmount' }
          }
        }
      ]);
      
      chartsData.claimsStatus = claimsData.map(item => ({
        status: item._id,
        count: item.count,
        amount: item.amount
      }));
    }
    
    successResponse(res, chartsData, 'Charts data retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get quick actions data with role-based filtering
 */
const getQuickActions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    let filter = {};
    if (userRole === 'agent') {
      filter = { assignedAgentId: userId };
    } else if (userRole === 'manager') {
      const teamMembers = await User.find({ role: 'agent' }).select('_id');
      const teamIds = teamMembers.map(member => member._id);
      teamIds.push(userId);
      filter = { assignedAgentId: { $in: teamIds } };
    }
    
    // Get pending items that need attention
    const [
      pendingClaims,
      expiringPolicies,
      overdueLeads,
      pendingQuotations
    ] = await Promise.all([
      Claim.find({ ...filter, status: { $in: ['reported', 'under_review'] } })
        .limit(5)
        .select('claimId claimAmount status createdAt')
        .lean(),
      Policy.find({ 
        ...filter, 
        endDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        status: 'active'
      })
        .limit(5)
        .select('policyNumber premium endDate')
        .lean(),
      Lead.find({ 
        ...filter, 
        status: { $in: ['new', 'contacted'] },
        updatedAt: { $lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
        .limit(5)
        .select('name email phone status updatedAt')
        .lean(),
      Quotation.find({ ...filter, status: 'sent' })
        .limit(5)
        .select('quotationId premiumAmount status createdAt')
        .lean()
    ]);
    
    const quickActions = {
      pendingClaims: {
        count: pendingClaims.length,
        items: pendingClaims
      },
      expiringPolicies: {
        count: expiringPolicies.length,
        items: expiringPolicies
      },
      overdueLeads: {
        count: overdueLeads.length,
        items: overdueLeads
      },
      pendingQuotations: {
        count: pendingQuotations.length,
        items: pendingQuotations
      }
    };
    
    successResponse(res, quickActions, 'Quick actions data retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
  getRecentActivities,
  getPerformanceMetrics,
  getChartsData,
  getQuickActions
};
