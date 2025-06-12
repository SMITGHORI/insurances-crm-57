const Client = require('../models/Client');
const { AppError } = require('../utils/errorHandler');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { uploadFile, deleteFile } = require('../utils/fileHandler');
const mongoose = require('mongoose');

class ClientController {
  /**
   * Get all clients with filtering, pagination, and search
   */
  async getAllClients(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        type,
        status,
        sortField = 'createdAt',
        sortDirection = 'desc'
      } = req.query;

      // Build filter object with role-based access
      const filter = {};
      
      // Apply agent filter from middleware
      if (req.agentFilter) {
        Object.assign(filter, req.agentFilter);
      }

      // Type filter
      if (type && type !== 'all') {
        filter.clientType = type;
      }

      // Status filter
      if (status && status !== 'All') {
        filter.status = status;
      }

      // Search functionality
      if (search) {
        filter.$or = [
          { clientId: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { 'individualData.firstName': { $regex: search, $options: 'i' } },
          { 'individualData.lastName': { $regex: search, $options: 'i' } },
          { 'corporateData.companyName': { $regex: search, $options: 'i' } },
          { 'groupData.groupName': { $regex: search, $options: 'i' } }
        ];
      }

      // Pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Sorting
      const sort = {};
      sort[sortField] = sortDirection === 'desc' ? -1 : 1;

      // Execute query
      const [clients, totalCount] = await Promise.all([
        Client.find(filter)
          .populate('assignedAgentId', 'name email')
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Client.countDocuments(filter)
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limitNum);

      return successResponse(res, {
        data: clients,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limitNum
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get client by ID
   */
  async getClientById(req, res, next) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid client ID', 400);
      }

      const filter = { _id: id };
      
      // Apply agent filter from middleware
      if (req.agentFilter) {
        Object.assign(filter, req.agentFilter);
      }

      const client = await Client.findOne(filter)
        .populate('assignedAgentId', 'name email phone')
        .populate('createdBy', 'name email')
        .lean();

      if (!client) {
        throw new AppError('Client not found or access denied', 404);
      }

      return successResponse(res, { data: client });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new client
   */
  async createClient(req, res, next) {
    try {
      const clientData = {
        ...req.body,
        createdBy: req.user._id
      };

      // Role-based assignment logic
      if (req.user.role === 'agent') {
        // Agents can only assign clients to themselves
        clientData.assignedAgentId = req.user._id;
      } else {
        // Super admin and managers can assign to any agent
        clientData.assignedAgentId = req.body.assignedAgentId || req.user._id;
      }

      // Move type-specific data to appropriate sub-document
      if (clientData.clientType === 'individual') {
        clientData.individualData = {
          firstName: clientData.firstName,
          lastName: clientData.lastName,
          dob: clientData.dob,
          gender: clientData.gender,
          panNumber: clientData.panNumber,
          aadharNumber: clientData.aadharNumber,
          occupation: clientData.occupation,
          annualIncome: clientData.annualIncome,
          maritalStatus: clientData.maritalStatus,
          nomineeName: clientData.nomineeName,
          nomineeRelation: clientData.nomineeRelation,
          nomineeContact: clientData.nomineeContact
        };
      } else if (clientData.clientType === 'corporate') {
        clientData.corporateData = {
          companyName: clientData.companyName,
          registrationNo: clientData.registrationNo,
          gstNumber: clientData.gstNumber,
          industry: clientData.industry,
          employeeCount: clientData.employeeCount,
          turnover: clientData.turnover,
          yearEstablished: clientData.yearEstablished,
          website: clientData.website,
          contactPersonName: clientData.contactPersonName,
          contactPersonDesignation: clientData.contactPersonDesignation,
          contactPersonEmail: clientData.contactPersonEmail,
          contactPersonPhone: clientData.contactPersonPhone
        };
      } else if (clientData.clientType === 'group') {
        clientData.groupData = {
          groupName: clientData.groupName,
          groupType: clientData.groupType,
          memberCount: clientData.memberCount,
          primaryContactName: clientData.primaryContactName,
          relationshipWithGroup: clientData.relationshipWithGroup,
          registrationID: clientData.registrationID,
          groupFormationDate: clientData.groupFormationDate,
          groupCategory: clientData.groupCategory,
          groupPurpose: clientData.groupPurpose
        };
      }

      const client = new Client(clientData);
      await client.save();

      return successResponse(res, {
        message: 'Client created successfully',
        data: client
      }, 201);
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new AppError(`${field} already exists`, 400);
      }
      next(error);
    }
  }

  /**
   * Update client with role-based field restrictions
   */
  async updateClient(req, res, next) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid client ID', 400);
      }

      const filter = { _id: id };
      
      // Apply agent filter from middleware
      if (req.agentFilter) {
        Object.assign(filter, req.agentFilter);
      }

      const client = await Client.findOne(filter);
      
      if (!client) {
        throw new AppError('Client not found or access denied', 404);
      }

      // Define allowed fields for agents (restricted access)
      const agentAllowedFields = [
        'phone', 'altPhone', 'address', 'city', 'state', 'pincode',
        'notes', 'source', 'occupation', 'annualIncome', 'maritalStatus'
      ];

      // Define restricted fields for agents
      const agentRestrictedFields = [
        'clientType', 'status', 'assignedAgentId', 'email',
        'panNumber', 'aadharNumber', 'registrationNo', 'gstNumber'
      ];

      // Filter update data based on user role
      let updateData = { ...req.body };
      
      if (req.user.role === 'agent') {
        // Remove restricted fields for agents
        agentRestrictedFields.forEach(field => {
          if (updateData[field] && updateData[field] !== client[field]) {
            throw new AppError(`Agents cannot modify ${field}`, 403);
          }
          delete updateData[field];
        });

        // Only allow specific fields for agents
        updateData = Object.keys(updateData)
          .filter(key => agentAllowedFields.includes(key) || key.startsWith('individualData.') || key.startsWith('corporateData.') || key.startsWith('groupData.'))
          .reduce((obj, key) => {
            obj[key] = updateData[key];
            return obj;
          }, {});
      }

      // Update fields
      Object.keys(updateData).forEach(key => {
        if (key !== '_id' && key !== 'clientId') {
          client[key] = updateData[key];
        }
      });

      client.updatedBy = req.user._id;
      await client.save();

      return successResponse(res, {
        message: 'Client updated successfully',
        data: client
      });
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new AppError(`${field} already exists`, 400);
      }
      next(error);
    }
  }

  /**
   * Delete client
   */
  async deleteClient(req, res, next) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid client ID', 400);
      }

      const client = await Client.findById(id);
      
      if (!client) {
        throw new AppError('Client not found', 404);
      }

      // Check if client has active policies
      if (client.policiesCount > 0) {
        throw new AppError('Cannot delete client with active policies', 400);
      }

      // Delete associated documents
      for (const doc of client.documents) {
        await deleteFile(doc.fileUrl);
      }

      await Client.findByIdAndDelete(id);

      return successResponse(res, {
        message: 'Client deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload client document
   */
  async uploadDocument(req, res, next) {
    try {
      const { id } = req.params;
      const { documentType } = req.body;

      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid client ID', 400);
      }

      const filter = { _id: id };
      
      // Apply agent filter from middleware
      if (req.agentFilter) {
        Object.assign(filter, req.agentFilter);
      }

      const client = await Client.findOne(filter);
      
      if (!client) {
        throw new AppError('Client not found or access denied', 404);
      }

      // Upload file
      const fileUrl = await uploadFile(req.file, 'documents');

      // Add document to client
      const documentData = {
        documentType,
        fileName: req.file.originalname,
        fileUrl,
        fileSize: req.file.size,
        uploadedBy: req.user._id
      };

      await client.addDocument(documentData);

      return successResponse(res, {
        message: 'Document uploaded successfully',
        data: documentData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get client documents
   */
  async getClientDocuments(req, res, next) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid client ID', 400);
      }

      const filter = { _id: id };
      
      // Apply agent filter from middleware
      if (req.agentFilter) {
        Object.assign(filter, req.agentFilter);
      }

      const client = await Client.findOne(filter, 'documents')
        .populate('documents.uploadedBy', 'name email');
      
      if (!client) {
        throw new AppError('Client not found or access denied', 404);
      }

      return successResponse(res, {
        data: client.documents
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete client document
   */
  async deleteDocument(req, res, next) {
    try {
      const { id, documentId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(documentId)) {
        throw new AppError('Invalid ID', 400);
      }

      const filter = { _id: id };
      
      // Apply agent filter from middleware
      if (req.agentFilter) {
        Object.assign(filter, req.agentFilter);
      }

      const client = await Client.findOne(filter);
      
      if (!client) {
        throw new AppError('Client not found or access denied', 404);
      }

      const document = client.documents.id(documentId);
      
      if (!document) {
        throw new AppError('Document not found', 404);
      }

      // Delete file from storage
      await deleteFile(document.fileUrl);

      // Remove document from client
      await client.removeDocument(documentId);

      return successResponse(res, {
        message: 'Document deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search clients
   */
  async searchClients(req, res, next) {
    try {
      const { query } = req.params;
      const { limit = 10 } = req.query;

      const filter = {};
      
      // Apply agent filter from middleware
      if (req.agentFilter) {
        Object.assign(filter, req.agentFilter);
      }

      const clients = await Client.searchClients(query, filter)
        .limit(parseInt(limit))
        .populate('assignedAgentId', 'name email')
        .lean();

      return successResponse(res, {
        data: clients
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get clients by agent with role-based access control
   */
  async getClientsByAgent(req, res, next) {
    try {
      const { agentId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(agentId)) {
        throw new AppError('Invalid agent ID', 400);
      }

      // Role-based access control
      if (req.user.role === 'agent' && req.user._id.toString() !== agentId) {
        throw new AppError('Agents can only view their own assigned clients', 403);
      }

      const clients = await Client.findByAgent(agentId)
        .populate('assignedAgentId', 'name email')
        .lean();

      return successResponse(res, {
        data: clients
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign client to agent
   */
  async assignClientToAgent(req, res, next) {
    try {
      const { id } = req.params;
      const { agentId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(agentId)) {
        throw new AppError('Invalid ID', 400);
      }

      const client = await Client.findById(id);
      
      if (!client) {
        throw new AppError('Client not found', 404);
      }

      client.assignedAgentId = agentId;
      client.updatedBy = req.user._id;
      await client.save();

      return successResponse(res, {
        message: 'Client assigned successfully',
        data: client
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get client statistics
   */
  async getClientStats(req, res, next) {
    try {
      const filter = {};
      
      // Apply agent filter from middleware
      if (req.agentFilter) {
        Object.assign(filter, req.agentFilter);
      }

      const stats = await Client.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalClients: { $sum: 1 },
            activeClients: {
              $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
            },
            inactiveClients: {
              $sum: { $cond: [{ $eq: ['$status', 'Inactive'] }, 1, 0] }
            },
            pendingClients: {
              $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
            },
            individualClients: {
              $sum: { $cond: [{ $eq: ['$clientType', 'individual'] }, 1, 0] }
            },
            corporateClients: {
              $sum: { $cond: [{ $eq: ['$clientType', 'corporate'] }, 1, 0] }
            },
            groupClients: {
              $sum: { $cond: [{ $eq: ['$clientType', 'group'] }, 1, 0] }
            }
          }
        }
      ]);

      return successResponse(res, {
        data: stats[0] || {
          totalClients: 0,
          activeClients: 0,
          inactiveClients: 0,
          pendingClients: 0,
          individualClients: 0,
          corporateClients: 0,
          groupClients: 0
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClientController();
