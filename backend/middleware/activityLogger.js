
const Activity = require('../models/Activity');
const UAParser = require('ua-parser-js');
const mongoose = require('mongoose');

/**
 * Middleware to automatically log all activities
 * This captures all API requests and logs them as activities
 */
class ActivityLogger {
  constructor() {
    this.excludedPaths = [
      '/api/activities', // Avoid logging activity queries
      '/api/health',
      '/api/status'
    ];
    
    this.sensitiveFields = [
      'password', 'token', 'secret', 'key', 'hash',
      'creditCard', 'ssn', 'bankAccount'
    ];
  }

  // Main middleware function
  middleware() {
    return async (req, res, next) => {
      // Skip if path is excluded
      if (this.shouldSkipLogging(req.path)) {
        return next();
      }

      // Store original body for comparison
      const originalBody = req.body ? JSON.parse(JSON.stringify(req.body)) : null;
      
      // Store start time for duration calculation
      const startTime = Date.now();

      // Override res.json to capture response
      const originalJson = res.json;
      let responseData = null;
      
      res.json = function(data) {
        responseData = data;
        return originalJson.call(this, data);
      };

      // Continue with the request
      res.on('finish', async () => {
        try {
          await this.logActivity(req, res, {
            originalBody,
            responseData,
            duration: Date.now() - startTime
          });
        } catch (error) {
          console.error('Failed to log activity:', error);
        }
      });

      next();
    };
  }

  shouldSkipLogging(path) {
    return this.excludedPaths.some(excludedPath => 
      path.startsWith(excludedPath)
    );
  }

  async logActivity(req, res, context) {
    const { originalBody, responseData, duration } = context;

    // Skip if user not authenticated
    if (!req.user) return;

    const activityData = this.buildActivityData(req, res, {
      originalBody,
      responseData,
      duration
    });

    // Only log if we have meaningful activity data
    if (activityData) {
      await Activity.logActivity(activityData);
    }
  }

  buildActivityData(req, res, context) {
    const { originalBody, responseData, duration } = context;
    const method = req.method;
    const path = req.path;
    const statusCode = res.statusCode;

    // Determine entity information from path
    const entityInfo = this.extractEntityInfo(path, originalBody, responseData);
    if (!entityInfo) return null;

    // Determine operation type
    const operation = this.getOperationType(method, statusCode);
    
    // Build activity description
    const action = this.buildActionDescription(operation, entityInfo, originalBody);
    
    // Extract change details for updates
    const changeDetails = this.extractChangeDetails(originalBody, responseData, operation);

    // Parse user agent
    const userAgent = req.get('User-Agent') || '';
    const parser = new UAParser(userAgent);
    const uaResult = parser.getResult();

    return {
      action,
      type: entityInfo.type,
      operation,
      description: `${operation.charAt(0).toUpperCase() + operation.slice(1)} ${entityInfo.type}: ${entityInfo.name}`,
      details: this.buildDetails(originalBody, changeDetails),
      entityType: entityInfo.type,
      entityId: mongoose.Types.ObjectId.isValid(entityInfo.id) ? entityInfo.id : new mongoose.Types.ObjectId(),
      entityName: entityInfo.name,
      clientId: entityInfo.clientId,
      clientName: entityInfo.clientName,
      agentId: entityInfo.agentId,
      agentName: entityInfo.agentName,
      userId: req.user._id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: req.user.role,
      changeDetails,
      beforeState: operation === 'update' ? this.sanitizeData(originalBody) : null,
      afterState: operation === 'update' ? this.sanitizeData(responseData?.data) : null,
      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent,
        method,
        endpoint: path,
        requestId: req.id || req.headers['x-request-id'],
        sessionId: req.sessionID,
        device: uaResult.device.type || 'desktop',
        browser: `${uaResult.browser.name} ${uaResult.browser.version}`,
        os: `${uaResult.os.name} ${uaResult.os.version}`
      },
      severity: this.getSeverity(operation, entityInfo.type, statusCode),
      category: this.getCategory(operation, entityInfo.type),
      isSuccessful: statusCode >= 200 && statusCode < 300,
      errorMessage: statusCode >= 400 ? responseData?.message : null,
      duration,
      tags: this.generateTags(operation, entityInfo.type, statusCode),
      performedBy: req.user._id
    };
  }

  extractEntityInfo(path, body, response) {
    const pathParts = path.split('/').filter(Boolean);
    
    // Skip api prefix
    if (pathParts[0] === 'api') pathParts.shift();
    
    const entityType = pathParts[0];
    const entityId = pathParts[1];

    // Map path to entity types
    const entityMap = {
      'clients': 'client',
      'policies': 'policy', 
      'claims': 'claim',
      'quotations': 'quotation',
      'leads': 'lead',
      'agents': 'agent',
      'users': 'user',
      'plans': 'plan',
      'invoices': 'invoice',
      'settings': 'setting'
    };

    const type = entityMap[entityType];
    if (!type) return null;

    // Extract entity details
    let name = 'Unknown';
    let id = entityId;
    let clientId = null;
    let clientName = null;
    let agentId = null;
    let agentName = null;

    // Get details from body or response
    const data = response?.data || body;
    if (data) {
      // Extract name based on entity type
      switch (type) {
        case 'client':
          name = data.firstName ? `${data.firstName} ${data.lastName}` : data.name || data.email;
          id = data._id || data.id || entityId;
          break;
        case 'policy':
          name = data.policyNumber || data.name;
          id = data._id || data.id || entityId;
          clientId = data.clientId;
          clientName = data.clientName;
          agentId = data.agentId;
          agentName = data.agentName;
          break;
        case 'claim':
          name = data.claimNumber || data.name;
          id = data._id || data.id || entityId;
          clientId = data.clientId;
          clientName = data.clientName;
          agentId = data.agentId;
          agentName = data.agentName;
          break;
        case 'quotation':
          name = data.quoteId || data.name;
          id = data._id || data.id || entityId;
          clientId = data.clientId;
          clientName = data.clientName;
          agentId = data.agentId;
          agentName = data.agentName;
          break;
        case 'lead':
          name = data.firstName ? `${data.firstName} ${data.lastName}` : data.name || data.email;
          id = data._id || data.id || entityId;
          agentId = data.agentId;
          agentName = data.agentName;
          break;
        case 'agent':
        case 'user':
          name = data.firstName ? `${data.firstName} ${data.lastName}` : data.name || data.email;
          id = data._id || data.id || entityId;
          break;
        default:
          name = data.name || data.title || data.id || entityId || 'Unknown';
          id = data._id || data.id || entityId;
      }
    }

    return {
      type,
      id: id || 'unknown',
      name,
      clientId,
      clientName,
      agentId,
      agentName
    };
  }

  getOperationType(method, statusCode) {
    if (statusCode >= 400) return 'error';
    
    switch (method) {
      case 'POST': return 'create';
      case 'GET': return 'read';
      case 'PUT':
      case 'PATCH': return 'update';
      case 'DELETE': return 'delete';
      default: return 'unknown';
    }
  }

  buildActionDescription(operation, entityInfo, body) {
    const actions = {
      create: `Created new ${entityInfo.type}`,
      update: `Updated ${entityInfo.type}`,
      delete: `Deleted ${entityInfo.type}`,
      read: `Viewed ${entityInfo.type}`,
      error: `Failed operation on ${entityInfo.type}`
    };
    
    return actions[operation] || `${operation} ${entityInfo.type}`;
  }

  extractChangeDetails(originalBody, responseData, operation) {
    if (operation !== 'update' || !originalBody) return [];
    
    const changes = [];
    const newData = responseData?.data || {};
    
    for (const [field, newValue] of Object.entries(originalBody)) {
      if (this.sensitiveFields.includes(field.toLowerCase())) continue;
      
      const oldValue = newData[field];
      if (oldValue !== newValue) {
        changes.push({
          field,
          oldValue: this.sanitizeValue(oldValue),
          newValue: this.sanitizeValue(newValue),
          dataType: this.getDataType(newValue)
        });
      }
    }
    
    return changes;
  }

  buildDetails(body, changeDetails) {
    if (changeDetails && changeDetails.length > 0) {
      const changedFields = changeDetails.map(c => c.field).join(', ');
      return `Modified fields: ${changedFields}`;
    }
    
    return body ? `Data: ${JSON.stringify(this.sanitizeData(body)).substring(0, 200)}...` : '';
  }

  sanitizeData(data) {
    if (!data || typeof data !== 'object') return data;
    
    const sanitized = { ...data };
    this.sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  sanitizeValue(value) {
    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...';
    }
    return value;
  }

  getDataType(value) {
    if (value === null || value === undefined) return 'string';
    if (Array.isArray(value)) return 'array';
    if (value instanceof Date) return 'date';
    return typeof value;
  }

  getSeverity(operation, entityType, statusCode) {
    if (statusCode >= 500) return 'critical';
    if (statusCode >= 400) return 'high';
    if (operation === 'delete') return 'high';
    if (['policy', 'claim'].includes(entityType)) return 'medium';
    return 'low';
  }

  getCategory(operation, entityType) {
    if (operation === 'error') return 'error_event';
    if (['login', 'logout'].includes(operation)) return 'security_event';
    if (entityType === 'setting') return 'system_event';
    return 'data_change';
  }

  generateTags(operation, entityType, statusCode) {
    const tags = [operation, entityType];
    
    if (statusCode >= 400) tags.push('error');
    if (statusCode >= 500) tags.push('server_error');
    if (['policy', 'claim'].includes(entityType)) tags.push('critical_data');
    
    return tags;
  }
}

module.exports = new ActivityLogger();
