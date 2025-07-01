const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Insurance CRM API',
      version: '1.0.0',
      description: 'A comprehensive Insurance Customer Relationship Management API built with Node.js, Express, and MongoDB Atlas. This API provides endpoints for managing leads, clients, policies, claims, agents, and more.',
      contact: {
        name: 'Insurance CRM Team',
        email: 'support@insurancecrm.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.insurancecrm.com' 
          : `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /api/auth/login endpoint'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Error message'
            },
            details: {
              type: 'object',
              description: 'Additional error details'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'integer',
              example: 1
            },
            totalPages: {
              type: 'integer',
              example: 10
            },
            totalItems: {
              type: 'integer',
              example: 100
            },
            itemsPerPage: {
              type: 'integer',
              example: 10
            }
          }
        },
        Lead: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            leadId: {
              type: 'string',
              example: 'LD000001'
            },
            name: {
              type: 'string',
              example: 'John Doe'
            },
            phone: {
              type: 'string',
              example: '+1234567890'
            },
            email: {
              type: 'string',
              example: 'john.doe@email.com'
            },
            address: {
              type: 'string',
              example: '123 Main St, City, State 12345'
            },
            source: {
              type: 'string',
              enum: ['Website', 'Referral', 'Cold Call', 'Social Media', 'Event', 'Advertisement', 'Other'],
              example: 'Website'
            },
            product: {
              type: 'string',
              enum: ['Health Insurance', 'Life Insurance', 'Motor Insurance', 'Home Insurance', 'Travel Insurance', 'Business Insurance'],
              example: 'Health Insurance'
            },
            status: {
              type: 'string',
              enum: ['New', 'In Progress', 'Qualified', 'Not Interested', 'Converted', 'Lost'],
              example: 'New'
            },
            budget: {
              type: 'number',
              example: 5000
            },
            assignedTo: {
              type: 'object',
              properties: {
                agentId: {
                  type: 'string',
                  example: '507f1f77bcf86cd799439012'
                },
                name: {
                  type: 'string',
                  example: 'Agent Smith'
                }
              }
            },
            priority: {
              type: 'string',
              enum: ['High', 'Medium', 'Low'],
              example: 'Medium'
            },
            additionalInfo: {
              type: 'string',
              example: 'Customer is interested in family health insurance'
            },
            followUps: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/FollowUp'
              }
            },
            notes: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Note'
              }
            },
            nextFollowUp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:00:00Z'
            },
            lastInteraction: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-10T14:30:00Z'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['hot-lead', 'family-insurance']
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-10T14:30:00Z'
            }
          }
        },
        FollowUp: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439013'
            },
            date: {
              type: 'string',
              format: 'date',
              example: '2024-01-15'
            },
            time: {
              type: 'string',
              example: '10:00'
            },
            type: {
              type: 'string',
              enum: ['Call', 'Email', 'Meeting', 'SMS', 'WhatsApp'],
              example: 'Call'
            },
            outcome: {
              type: 'string',
              example: 'Customer showed interest, scheduled another call'
            },
            nextAction: {
              type: 'string',
              example: 'Send insurance quotes via email'
            },
            createdBy: {
              type: 'string',
              example: 'Agent Smith'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-10T14:30:00Z'
            }
          }
        },
        Note: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439014'
            },
            content: {
              type: 'string',
              example: 'Customer prefers comprehensive health insurance coverage'
            },
            createdBy: {
              type: 'string',
              example: 'Agent Smith'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-10T14:30:00Z'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'Access denied. No token provided.'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Insufficient permissions to access this resource',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'Access denied. Insufficient permissions.'
              }
            }
          }
        },
        NotFoundError: {
          description: 'The requested resource was not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'Resource not found'
              }
            }
          }
        },
        ValidationError: {
          description: 'Request validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'Validation failed',
                details: {
                  field: 'email',
                  message: 'Invalid email format'
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './models/*.js',
    './controllers/*.js'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerSpec };