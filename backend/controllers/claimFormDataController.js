
const { responseHandler } = require('../utils/responseHandler');
const { AppError } = require('../utils/errorHandler');
const Policy = require('../models/Policy');
const Client = require('../models/Client');
const Claim = require('../models/Claim');
const mongoose = require('mongoose');

/**
 * Get policies for claim form with role-based filtering
 */
const getPoliciesForClaim = async (req, res, next) => {
  try {
    const { search, type, status, limit = 50 } = req.query;
    const { user } = req;

    // Build base query
    let query = { isDeleted: false };

    // Apply role-based filtering
    switch (user.role) {
      case 'super_admin':
        // No additional filters - can see all policies
        break;
      case 'manager':
        // TODO: Add team/region filtering logic
        // query.assignedAgentId = { $in: teamAgentIds };
        break;
      case 'agent':
        // Only policies assigned to this agent
        query.assignedAgentId = user._id;
        break;
      default:
        throw new AppError('Invalid user role', 403);
    }

    // Apply filters
    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    // Apply search
    if (search) {
      query.$or = [
        { policyNumber: { $regex: search, $options: 'i' } },
        { companyPolicyNumber: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const limitNum = Math.min(parseInt(limit) || 50, 100); // Cap at 100
    
    const [policies, total] = await Promise.all([
      Policy.find(query)
        .populate('clientId', 'displayName email phone clientType')
        .select('policyNumber type status company premium coverage startDate endDate clientId')
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      Policy.countDocuments(query)
    ]);

    responseHandler.success(res, policies, 'Policies retrieved successfully', { total });
  } catch (error) {
    next(error);
  }
};

/**
 * Get clients for claim form with role-based filtering
 */
const getClientsForClaim = async (req, res, next) => {
  try {
    const { search, type, status, limit = 50 } = req.query;
    const { user } = req;

    // Build base query
    let query = {};

    // Apply role-based filtering
    switch (user.role) {
      case 'super_admin':
        // No additional filters - can see all clients
        break;
      case 'manager':
        // TODO: Add team/region filtering logic
        // query.assignedAgentId = { $in: teamAgentIds };
        break;
      case 'agent':
        // Only clients assigned to this agent
        query.assignedAgentId = user._id;
        break;
      default:
        throw new AppError('Invalid user role', 403);
    }

    // Apply filters
    if (type) {
      query.clientType = type;
    }

    if (status) {
      query.status = status;
    }

    // Apply search
    if (search) {
      query.$or = [
        { clientId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'individualData.firstName': { $regex: search, $options: 'i' } },
        { 'individualData.lastName': { $regex: search, $options: 'i' } },
        { 'corporateData.companyName': { $regex: search, $options: 'i' } },
        { 'groupData.groupName': { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const limitNum = Math.min(parseInt(limit) || 50, 100); // Cap at 100

    const [clients, total] = await Promise.all([
      Client.find(query)
        .select('clientId clientType displayName email phone status policiesCount')
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      Client.countDocuments(query)
    ]);

    // Add additional computed fields
    const enrichedClients = await Promise.all(
      clients.map(async (client) => {
        // Get active policies count
        const activePoliciesCount = await Policy.countDocuments({
          clientId: client._id,
          status: 'active',
          isDeleted: false
        });

        // Get last claim date
        const lastClaim = await Claim.findOne({
          clientId: client._id,
          isDeleted: false
        }).sort({ createdAt: -1 }).select('createdAt');

        return {
          ...client.toObject(),
          activePoliciesCount,
          lastClaimDate: lastClaim?.createdAt || null
        };
      })
    );

    responseHandler.success(res, enrichedClients, 'Clients retrieved successfully', { total });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed policy information for claim creation
 */
const getPolicyDetails = async (req, res, next) => {
  try {
    const { policyId } = req.params;
    const { user } = req;

    // Validate policy ID
    if (!mongoose.Types.ObjectId.isValid(policyId)) {
      throw new AppError('Invalid policy ID format', 400);
    }

    // Build query with role-based filtering
    let query = { _id: policyId, isDeleted: false };

    // Apply role-based filtering
    switch (user.role) {
      case 'super_admin':
        // No additional filters
        break;
      case 'manager':
        // TODO: Add team/region filtering logic
        break;
      case 'agent':
        // Only policies assigned to this agent
        query.assignedAgentId = user._id;
        break;
      default:
        throw new AppError('Invalid user role', 403);
    }

    // Get policy with populated relationships
    const policy = await Policy.findOne(query)
      .populate('clientId', 'clientId displayName email phone clientType individualData corporateData groupData')
      .populate('assignedAgentId', 'firstName lastName email')
      .select('-documents -paymentHistory -renewalHistory -notes'); // Exclude large fields

    if (!policy) {
      throw new AppError('Policy not found or not accessible', 404);
    }

    // Get claims history for this policy
    const claimsHistory = await Claim.aggregate([
      { $match: { policyId: policy._id, isDeleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          totalClaims: { $sum: 1 },
          settledClaims: {
            $sum: { $cond: [{ $eq: ['$status', 'Settled'] }, 1, 0] }
          },
          pendingClaims: {
            $sum: { $cond: [{ $in: ['$status', ['Reported', 'Under Review', 'Pending', 'Approved']] }, 1, 0] }
          },
          rejectedClaims: {
            $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] }
          },
          totalClaimedAmount: { $sum: '$claimAmount' },
          totalSettledAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'Settled'] }, '$approvedAmount', 0] }
          }
        }
      }
    ]);

    // Format claims history
    const claimsStats = claimsHistory[0] || {
      totalClaims: 0,
      settledClaims: 0,
      pendingClaims: 0,
      rejectedClaims: 0,
      totalClaimedAmount: 0,
      totalSettledAmount: 0
    };

    // Add claims history to policy object
    const policyWithClaims = {
      ...policy.toObject(),
      claimsHistory: claimsStats
    };

    responseHandler.success(res, policyWithClaims, 'Policy details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPoliciesForClaim,
  getClientsForClaim,
  getPolicyDetails
};
