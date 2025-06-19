
const Policy = require('../models/Policy');
const Client = require('../models/Client');
const User = require('../models/User');

/**
 * Form data controller methods for claim creation
 */

// Get policies for claim creation
exports.getPoliciesForClaim = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    let filter = { isDeleted: false, status: 'active' };

    // Role-based filtering
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      filter.assignedAgentId = { $in: agentIds };
    }

    const policies = await Policy.find(filter)
      .populate('clientId', 'displayName email phone')
      .select('policyNumber type company clientId premium coverage startDate endDate')
      .sort({ policyNumber: 1 });

    res.status(200).json({
      success: true,
      data: policies
    });

  } catch (error) {
    console.error('Error fetching policies for claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch policies',
      error: error.message
    });
  }
};

// Get clients for claim creation
exports.getClientsForClaim = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    let filter = { isDeleted: false, status: 'Active' };

    // Role-based filtering through policies
    if (role === 'agent') {
      const agentPolicyClients = await Policy.find({ 
        assignedAgentId: userId, 
        isDeleted: false 
      }).select('clientId');
      const clientIds = agentPolicyClients.map(p => p.clientId);
      filter._id = { $in: clientIds };
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      const teamPolicyClients = await Policy.find({ 
        assignedAgentId: { $in: agentIds }, 
        isDeleted: false 
      }).select('clientId');
      const clientIds = teamPolicyClients.map(p => p.clientId);
      filter._id = { $in: clientIds };
    }

    const clients = await Client.find(filter)
      .select('displayName email phone clientType address city state')
      .sort({ displayName: 1 });

    res.status(200).json({
      success: true,
      data: clients
    });

  } catch (error) {
    console.error('Error fetching clients for claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients',
      error: error.message
    });
  }
};

// Get specific policy details for claim form
exports.getPolicyDetails = async (req, res) => {
  try {
    const { policyId } = req.params;
    const { role, _id: userId } = req.user;

    let filter = { _id: policyId, isDeleted: false };

    // Role-based access check
    if (role === 'agent') {
      filter.assignedAgentId = userId;
    } else if (role === 'manager') {
      const teamAgents = await User.find({ managerId: userId }).select('_id');
      const agentIds = teamAgents.map(agent => agent._id);
      agentIds.push(userId);
      filter.assignedAgentId = { $in: agentIds };
    }

    const policy = await Policy.findOne(filter)
      .populate('clientId', 'displayName email phone address city state')
      .populate('assignedAgentId', 'firstName lastName email');

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: policy
    });

  } catch (error) {
    console.error('Error fetching policy details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch policy details',
      error: error.message
    });
  }
};
