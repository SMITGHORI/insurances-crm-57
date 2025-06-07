
const User = require('../models/User');
const Client = require('../models/Client');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const Lead = require('../models/Lead');
const Quotation = require('../models/Quotation');
const Activity = require('../models/Activity');
const { AppError } = require('../utils/errorHandler');
const { successResponse } = require('../utils/responseHandler');

/**
 * Get dashboard overview stats
 * @route GET /api/dashboard/overview
 * @access Private
 */
const getDashboardOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Build filter based on user role
    const filter = userRole === 'super_admin' ? {} : { assignedTo: userId };
    
    // Get counts for different entities
    const [
      totalClients,
      activeClients,
      totalPolicies,
      activePolicies,
      totalClaims,
      pendingClaims,
      totalLeads,
      activeLeads,
      totalQuotations,
      pendingQuotations
    ] = await Promise.all([
      Client.countDocuments(filter),
      Client.countDocuments({ ...filter, status: 'active' }),
      Policy.countDocuments(filter),
      Policy.countDocuments({ ...filter, status: 'active' }),
      Claim.countDocuments(filter),
      Claim.countDocuments({ ...filter, status: { $in: ['submitted', 'under_review'] } }),
      Lead.countDocuments(filter),
      Lead.countDocuments({ ...filter, status: { $in: ['new', 'contacted', 'qualified'] } }),
      Quotation.countDocuments(filter),
      Quotation.countDocuments({ ...filter, status: { $in: ['draft', 'sent', 'under_review'] } })
    ]);
    
    // Calculate conversion rates
    const leadConversionRate = totalLeads > 0 ? ((activePolicies / totalLeads) * 100).toFixed(2) : 0;
    const quotationConversionRate = totalQuotations > 0 ? ((activePolicies / totalQuotations) * 100).toFixed(2) : 0;
    
    const overview = {
      clients: {
        total: totalClients,
        active: activeClients,
        trend: '+12%' // This would be calculated from historical data
      },
      policies: {
        total: totalPolicies,
        active: activePolicies,
        trend: '+8%'
      },
      claims: {
        total: totalClaims,
        pending: pendingClaims,
        trend: '-5%'
      },
      leads: {
        total: totalLeads,
        active: activeLeads,
        conversionRate: leadConversionRate,
        trend: '+15%'
      },
      quotations: {
        total: totalQuotations,
        pending: pendingQuotations,
        conversionRate: quotationConversionRate,
        trend: '+10%'
      }
    };
    
    successResponse(res, overview, 'Dashboard overview retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent activities for dashboard
 * @route GET /api/dashboard/activities
 * @access Private
 */
const getRecentActivities = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { limit = 10 } = req.query;
    
    // Build filter based on user role
    const filter = userRole === 'super_admin' ? {} : { 
      $or: [
        { performedBy: userId },
        { assignedTo: userId },
        { relatedUsers: userId }
      ]
    };
    
    const activities = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('performedBy', 'name email')
      .populate('relatedClient', 'name email')
      .lean();
    
    successResponse(res, activities, 'Recent activities retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get performance metrics for dashboard
 * @route GET /api/dashboard/performance
 * @access Private
 */
const getPerformanceMetrics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { period = '30d' } = req.query;
    
    // Calculate date range based on period
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
    
    const filter = userRole === 'super_admin' ? {} : { assignedTo: userId };
    const dateFilter = { createdAt: { $gte: startDate, $lte: now } };
    
    // Get metrics for the period
    const [
      newClients,
      newPolicies,
      newClaims,
      newLeads,
      totalRevenue
    ] = await Promise.all([
      Client.countDocuments({ ...filter, ...dateFilter }),
      Policy.countDocuments({ ...filter, ...dateFilter }),
      Claim.countDocuments({ ...filter, ...dateFilter }),
      Lead.countDocuments({ ...filter, ...dateFilter }),
      Policy.aggregate([
        { $match: { ...filter, ...dateFilter } },
        { $group: { _id: null, total: { $sum: '$premium' } } }
      ])
    ]);
    
    const metrics = {
      period,
      newClients,
      newPolicies,
      newClaims,
      newLeads,
      totalRevenue: totalRevenue[0]?.total || 0,
      averageDealSize: newPolicies > 0 ? ((totalRevenue[0]?.total || 0) / newPolicies).toFixed(2) : 0
    };
    
    successResponse(res, metrics, 'Performance metrics retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard charts data
 * @route GET /api/dashboard/charts
 * @access Private
 */
const getChartsData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { type = 'all' } = req.query;
    
    const filter = userRole === 'super_admin' ? {} : { assignedTo: userId };
    
    // Get data for different chart types
    const chartsData = {};
    
    if (type === 'all' || type === 'revenue') {
      // Revenue chart data (last 12 months)
      const revenueData = await Policy.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$premium' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ]);
      
      chartsData.revenue = revenueData.map(item => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        revenue: item.revenue,
        policies: item.count
      }));
    }
    
    if (type === 'all' || type === 'leads') {
      // Leads funnel data
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
            totalAmount: { $sum: '$claimAmount' }
          }
        }
      ]);
      
      chartsData.claimsStatus = claimsData.map(item => ({
        status: item._id,
        count: item.count,
        amount: item.totalAmount
      }));
    }
    
    successResponse(res, chartsData, 'Charts data retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard quick actions data
 * @route GET /api/dashboard/quick-actions
 * @access Private
 */
const getQuickActions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    const filter = userRole === 'super_admin' ? {} : { assignedTo: userId };
    
    // Get pending items that need attention
    const [
      pendingClaims,
      expiringPolicies,
      overdueLeads,
      pendingQuotations
    ] = await Promise.all([
      Claim.find({ ...filter, status: { $in: ['submitted', 'under_review'] } })
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
        lastContactDate: { $lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
        .limit(5)
        .select('name email phone status lastContactDate')
        .lean(),
      Quotation.find({ ...filter, status: 'sent' })
        .limit(5)
        .select('quotationNumber totalAmount status createdAt')
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
