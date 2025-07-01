
const Activity = require('../models/Activity');
const WebSocketManager = require('./websocket');

class AuditLogger {
  constructor() {
    this.sensitiveFields = [
      'password', 'token', 'secret', 'key', 'hash',
      'creditCard', 'ssn', 'bankAccount', 'pin'
    ];
  }

  middleware() {
    return async (req, res, next) => {
      // Skip health check and static routes
      if (this.shouldSkipAudit(req.path)) {
        return next();
      }

      const startTime = Date.now();
      const originalBody = req.body ? JSON.parse(JSON.stringify(req.body)) : null;
      
      // Capture response data
      const originalJson = res.json;
      let responseData = null;
      
      res.json = function(data) {
        responseData = data;
        return originalJson.call(this, data);
      };

      const auditLogger = this; // Store reference to AuditLogger instance
      
      res.on('finish', async () => {
        try {
          await auditLogger.logAuditEvent(req, res, {
            originalBody,
            responseData,
            duration: Date.now() - startTime
          });
        } catch (error) {
          console.error('Audit logging failed:', error);
        }
      });

      next();
    };
  }

  shouldSkipAudit(path) {
    const skipPaths = ['/api/health', '/api/status', '/favicon.ico'];
    return skipPaths.some(skipPath => path.startsWith(skipPath));
  }

  async logAuditEvent(req, res, context) {
    if (!req.user) return;

    const { originalBody, responseData, duration } = context;
    const auditData = this.buildAuditData(req, res, context);

    if (auditData) {
      // Log to database
      await Activity.logActivity(auditData);

      // Real-time notification for critical events
      if (auditData.severity === 'high' || auditData.severity === 'critical') {
        WebSocketManager.emitToRole('super_admin', 'critical-audit-event', {
          event: auditData.action,
          user: auditData.userName,
          timestamp: new Date(),
          severity: auditData.severity
        });
      }

      // Entity-specific real-time updates
      if (auditData.entityType && auditData.entityId) {
        WebSocketManager.emitToEntity(
          auditData.entityType, 
          auditData.entityId, 
          'entity-updated', 
          {
            entityType: auditData.entityType,
            entityId: auditData.entityId,
            action: auditData.operation,
            updatedBy: auditData.userName
          }
        );
      }
    }
  }

  buildAuditData(req, res, context) {
    const { originalBody, responseData, duration } = context;
    const method = req.method;
    const path = req.path;
    const statusCode = res.statusCode;

    const entityInfo = this.extractEntityInfo(path, originalBody, responseData);
    if (!entityInfo) return null;

    const operation = this.getOperationType(method, statusCode);
    const action = this.buildActionDescription(operation, entityInfo);

    return {
      action,
      type: entityInfo.type,
      operation,
      description: `${operation.charAt(0).toUpperCase() + operation.slice(1)} ${entityInfo.type}: ${entityInfo.name}`,
      entityType: entityInfo.type,
      entityId: entityInfo.id,
      entityName: entityInfo.name,
      userId: req.user._id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: req.user.role,
      details: this.sanitizeData(originalBody),
      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        method,
        endpoint: path,
        duration,
        statusCode
      },
      severity: this.getSeverity(operation, entityInfo.type, statusCode),
      category: this.getCategory(operation, entityInfo.type),
      isSuccessful: statusCode >= 200 && statusCode < 300,
      errorMessage: statusCode >= 400 ? responseData?.message : null,
      createdBy: req.user._id
    };
  }

  extractEntityInfo(path, body, response) {
    const pathParts = path.split('/').filter(Boolean);
    if (pathParts[0] === 'api') pathParts.shift();
    
    const entityType = pathParts[0];
    const entityId = pathParts[1];

    const entityMap = {
      'clients': 'client',
      'policies': 'policy',
      'claims': 'claim',
      'quotations': 'quotation',
      'leads': 'lead',
      'agents': 'agent',
      'invoices': 'invoice'
    };

    const type = entityMap[entityType];
    if (!type) return null;

    const data = response?.data || body;
    let name = 'Unknown';
    let id = entityId;

    if (data) {
      switch (type) {
        case 'client':
          name = data.firstName ? `${data.firstName} ${data.lastName}` : data.email;
          break;
        case 'policy':
          name = data.policyNumber || data.name;
          break;
        case 'claim':
          name = data.claimNumber || data.name;
          break;
        case 'quotation':
          name = data.quoteId || data.name;
          break;
        default:
          name = data.name || data.id || entityId || 'Unknown';
      }
      id = data._id || data.id || entityId;
    }

    return { type, id: id || 'unknown', name };
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

  buildActionDescription(operation, entityInfo) {
    const actions = {
      create: `Created new ${entityInfo.type}`,
      update: `Updated ${entityInfo.type}`,
      delete: `Deleted ${entityInfo.type}`,
      read: `Viewed ${entityInfo.type}`,
      error: `Failed operation on ${entityInfo.type}`
    };
    
    return actions[operation] || `${operation} ${entityInfo.type}`;
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
    if (entityType === 'setting') return 'system_event';
    return 'data_change';
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
}

module.exports = new AuditLogger();
