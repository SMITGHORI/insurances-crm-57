
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Insurance CRM API',
      version: '1.0.0',
      description: 'A comprehensive Insurance Customer Relationship Management API built with Node.js, Express, and MongoDB Atlas. This API provides endpoints for managing leads, clients, policies, claims, agents, activities, broadcasts, offers, and more.',
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
          : `http://localhost:${process.env.PORT || 3000}`,
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
            totalCount: {
              type: 'integer',
              example: 100
            },
            itemsPerPage: {
              type: 'integer',
              example: 10
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            username: {
              type: 'string',
              example: 'admin'
            },
            email: {
              type: 'string',
              example: 'admin@example.com'
            },
            role: {
              type: 'string',
              enum: ['super_admin', 'manager', 'agent'],
              example: 'super_admin'
            },
            fullName: {
              type: 'string',
              example: 'Admin User'
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Client: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            clientId: {
              type: 'string',
              example: 'CL000001'
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
            dateOfBirth: {
              type: 'string',
              format: 'date',
              example: '1985-06-15'
            },
            gender: {
              type: 'string',
              enum: ['Male', 'Female', 'Other'],
              example: 'Male'
            },
            assignedAgentId: {
              type: 'string',
              example: '507f1f77bcf86cd799439012'
            },
            status: {
              type: 'string',
              enum: ['Active', 'Inactive', 'Suspended'],
              example: 'Active'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Policy: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            policyNumber: {
              type: 'string',
              example: 'POL000001'
            },
            clientId: {
              type: 'string',
              example: '507f1f77bcf86cd799439012'
            },
            insuranceType: {
              type: 'string',
              enum: ['Health', 'Life', 'Motor', 'Home', 'Travel', 'Business'],
              example: 'Health'
            },
            premium: {
              type: 'number',
              example: 5000
            },
            coverageAmount: {
              type: 'number',
              example: 100000
            },
            startDate: {
              type: 'string',
              format: 'date',
              example: '2024-01-01'
            },
            endDate: {
              type: 'string',
              format: 'date',
              example: '2024-12-31'
            },
            status: {
              type: 'string',
              enum: ['Active', 'Expired', 'Cancelled', 'Pending'],
              example: 'Active'
            },
            assignedAgentId: {
              type: 'string',
              example: '507f1f77bcf86cd799439013'
            }
          }
        },
        Claim: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            claimNumber: {
              type: 'string',
              example: 'CLM000001'
            },
            policyId: {
              type: 'string',
              example: '507f1f77bcf86cd799439012'
            },
            clientId: {
              type: 'string',
              example: '507f1f77bcf86cd799439013'
            },
            claimAmount: {
              type: 'number',
              example: 15000
            },
            dateOfIncident: {
              type: 'string',
              format: 'date',
              example: '2024-01-15'
            },
            description: {
              type: 'string',
              example: 'Car accident on highway'
            },
            status: {
              type: 'string',
              enum: ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Settled'],
              example: 'Under Review'
            },
            assignedTo: {
              type: 'string',
              example: '507f1f77bcf86cd799439014'
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
              example: 'Jane Smith'
            },
            phone: {
              type: 'string',
              example: '+1234567890'
            },
            email: {
              type: 'string',
              example: 'jane.smith@email.com'
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
            assignedTo: {
              type: 'string',
              example: '507f1f77bcf86cd799439012'
            },
            priority: {
              type: 'string',
              enum: ['High', 'Medium', 'Low'],
              example: 'Medium'
            }
          }
        },
        Agent: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            agentId: {
              type: 'string',
              example: 'AG000001'
            },
            name: {
              type: 'string',
              example: 'Agent Smith'
            },
            email: {
              type: 'string',
              example: 'agent.smith@company.com'
            },
            phone: {
              type: 'string',
              example: '+1234567890'
            },
            licenseNumber: {
              type: 'string',
              example: 'LIC123456'
            },
            department: {
              type: 'string',
              example: 'Sales'
            },
            status: {
              type: 'string',
              enum: ['Active', 'Inactive', 'Suspended'],
              example: 'Active'
            },
            commissionRate: {
              type: 'number',
              example: 0.05
            }
          }
        },
        Quotation: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            quotationNumber: {
              type: 'string',
              example: 'QT000001'
            },
            clientId: {
              type: 'string',
              example: '507f1f77bcf86cd799439012'
            },
            insuranceType: {
              type: 'string',
              enum: ['Health', 'Life', 'Motor', 'Home', 'Travel', 'Business'],
              example: 'Health'
            },
            premium: {
              type: 'number',
              example: 5000
            },
            coverageAmount: {
              type: 'number',
              example: 100000
            },
            validUntil: {
              type: 'string',
              format: 'date',
              example: '2024-02-01'
            },
            status: {
              type: 'string',
              enum: ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'],
              example: 'Draft'
            },
            agentId: {
              type: 'string',
              example: '507f1f77bcf86cd799439013'
            }
          }
        },
        Activity: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            activityId: {
              type: 'string',
              example: 'ACT000001'
            },
            type: {
              type: 'string',
              enum: ['client', 'policy', 'claim', 'lead', 'quotation', 'user'],
              example: 'client'
            },
            operation: {
              type: 'string',
              enum: ['create', 'update', 'delete', 'read'],
              example: 'create'
            },
            description: {
              type: 'string',
              example: 'Created new client record'
            },
            entityType: {
              type: 'string',
              example: 'client'
            },
            entityId: {
              type: 'string',
              example: '507f1f77bcf86cd799439012'
            },
            entityName: {
              type: 'string',
              example: 'John Doe'
            },
            userId: {
              type: 'string',
              example: '507f1f77bcf86cd799439013'
            },
            userName: {
              type: 'string',
              example: 'Agent Smith'
            },
            details: {
              type: 'string',
              example: 'Additional activity details'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Broadcast: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            broadcastId: {
              type: 'string',
              example: 'BC000001'
            },
            title: {
              type: 'string',
              example: 'Health Insurance Promotion'
            },
            message: {
              type: 'string',
              example: 'Special offer on health insurance plans'
            },
            type: {
              type: 'string',
              enum: ['SMS', 'Email', 'WhatsApp', 'Push'],
              example: 'Email'
            },
            targetAudience: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['All Clients', 'Health Insurance Clients']
            },
            status: {
              type: 'string',
              enum: ['Draft', 'Scheduled', 'Sent', 'Failed'],
              example: 'Draft'
            },
            scheduledAt: {
              type: 'string',
              format: 'date-time'
            },
            sentAt: {
              type: 'string',
              format: 'date-time'
            },
            createdBy: {
              type: 'string',
              example: '507f1f77bcf86cd799439012'
            }
          }
        },
        Offer: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            offerId: {
              type: 'string',
              example: 'OF000001'
            },
            title: {
              type: 'string',
              example: '20% Off Health Insurance'
            },
            description: {
              type: 'string',
              example: 'Special discount on health insurance premiums'
            },
            discountType: {
              type: 'string',
              enum: ['Percentage', 'Fixed Amount'],
              example: 'Percentage'
            },
            discountValue: {
              type: 'number',
              example: 20
            },
            validFrom: {
              type: 'string',
              format: 'date',
              example: '2024-01-01'
            },
            validTo: {
              type: 'string',
              format: 'date',
              example: '2024-01-31'
            },
            applicableProducts: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Health Insurance', 'Life Insurance']
            },
            status: {
              type: 'string',
              enum: ['Active', 'Inactive', 'Expired'],
              example: 'Active'
            },
            createdBy: {
              type: 'string',
              example: '507f1f77bcf86cd799439012'
            }
          }
        },
        Invoice: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            invoiceNumber: {
              type: 'string',
              example: 'INV000001'
            },
            clientId: {
              type: 'string',
              example: '507f1f77bcf86cd799439012'
            },
            amount: {
              type: 'number',
              example: 5000
            },
            dueDate: {
              type: 'string',
              format: 'date',
              example: '2024-02-01'
            },
            status: {
              type: 'string',
              enum: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'],
              example: 'Sent'
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  description: {
                    type: 'string',
                    example: 'Health Insurance Premium'
                  },
                  quantity: {
                    type: 'number',
                    example: 1
                  },
                  rate: {
                    type: 'number',
                    example: 5000
                  },
                  amount: {
                    type: 'number',
                    example: 5000
                  }
                }
              }
            }
          }
        },
        Role: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'super_admin'
            },
            displayName: {
              type: 'string',
              example: 'Super Administrator'
            },
            description: {
              type: 'string',
              example: 'Full system access'
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['create_users', 'delete_users', 'manage_roles']
            },
            isActive: {
              type: 'boolean',
              example: true
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Authentication and authorization endpoints'
      },
      {
        name: 'Dashboard',
        description: 'Dashboard data and statistics'
      },
      {
        name: 'Clients',
        description: 'Client management operations'
      },
      {
        name: 'Policies',
        description: 'Insurance policy management'
      },
      {
        name: 'Claims',
        description: 'Insurance claim management'
      },
      {
        name: 'Leads',
        description: 'Lead management and tracking'
      },
      {
        name: 'Agents',
        description: 'Agent management and performance'
      },
      {
        name: 'Quotations',
        description: 'Insurance quotation management'
      },
      {
        name: 'Activities',
        description: 'System activity tracking and logs'
      },
      {
        name: 'Broadcasts',
        description: 'Mass communication broadcasts'
      },
      {
        name: 'Communication',
        description: 'Client communication and messaging'
      },
      {
        name: 'Campaigns',
        description: 'Marketing campaign management'
      },
      {
        name: 'Invoices',
        description: 'Invoice generation and management'
      },
      {
        name: 'Settings',
        description: 'User and system settings'
      },
      {
        name: 'Roles',
        description: 'Role and permission management'
      },
      {
        name: 'Header',
        description: 'Header data and notifications'
      }
    ],
    paths: {
      // Authentication endpoints
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'User login',
          description: 'Authenticate user and return JWT token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    username: {
                      type: 'string',
                      example: 'admin'
                    },
                    password: {
                      type: 'string',
                      example: 'password123'
                    }
                  },
                  required: ['username', 'password']
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      token: {
                        type: 'string',
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                      },
                      user: {
                        $ref: '#/components/schemas/User'
                      }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/api/auth/logout': {
        post: {
          tags: ['Authentication'],
          summary: 'User logout',
          description: 'Logout user and clear session',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Logout successful',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Success'
                  }
                }
              }
            }
          }
        }
      },
      '/api/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current user',
          description: 'Get current authenticated user information',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'User information retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      user: {
                        $ref: '#/components/schemas/User'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      // Dashboard endpoints
      '/api/dashboard/overview': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get dashboard overview',
          description: 'Get dashboard overview with role-based data',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Dashboard overview data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        type: 'object',
                        properties: {
                          stats: {
                            type: 'object',
                            properties: {
                              totalClients: {
                                type: 'number',
                                example: 150
                              },
                              totalPolicies: {
                                type: 'number',
                                example: 200
                              },
                              totalClaims: {
                                type: 'number',
                                example: 25
                              },
                              totalLeads: {
                                type: 'number',
                                example: 75
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/dashboard/activities': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get recent activities',
          description: 'Get recent activities with role-based filtering',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'limit',
              in: 'query',
              schema: {
                type: 'integer',
                default: 10
              },
              description: 'Number of activities to return'
            }
          ],
          responses: {
            200: {
              description: 'Recent activities data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Activity'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      // Clients endpoints
      '/api/clients': {
        get: {
          tags: ['Clients'],
          summary: 'Get all clients',
          description: 'Get all clients with filtering, pagination, and search',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: {
                type: 'integer',
                default: 1
              }
            },
            {
              name: 'limit',
              in: 'query',
              schema: {
                type: 'integer',
                default: 10
              }
            },
            {
              name: 'search',
              in: 'query',
              schema: {
                type: 'string'
              }
            },
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['Active', 'Inactive', 'Suspended']
              }
            }
          ],
          responses: {
            200: {
              description: 'List of clients',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Client'
                        }
                      },
                      pagination: {
                        $ref: '#/components/schemas/PaginationMeta'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Clients'],
          summary: 'Create new client',
          description: 'Create a new client record',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
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
                    dateOfBirth: {
                      type: 'string',
                      format: 'date',
                      example: '1985-06-15'
                    },
                    gender: {
                      type: 'string',
                      enum: ['Male', 'Female', 'Other'],
                      example: 'Male'
                    }
                  },
                  required: ['name', 'phone', 'email']
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Client created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        $ref: '#/components/schemas/Client'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/clients/{id}': {
        get: {
          tags: ['Clients'],
          summary: 'Get client by ID',
          description: 'Get a specific client by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            200: {
              description: 'Client details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        $ref: '#/components/schemas/Client'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        put: {
          tags: ['Clients'],
          summary: 'Update client',
          description: 'Update an existing client',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Client'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Client updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        $ref: '#/components/schemas/Client'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        delete: {
          tags: ['Clients'],
          summary: 'Delete client',
          description: 'Delete a client (soft delete)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            200: {
              description: 'Client deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Success'
                  }
                }
              }
            }
          }
        }
      },
      // Policies endpoints
      '/api/policies': {
        get: {
          tags: ['Policies'],
          summary: 'Get all policies',
          description: 'Get all policies with filtering, pagination, and search',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: {
                type: 'integer',
                default: 1
              }
            },
            {
              name: 'limit',
              in: 'query',
              schema: {
                type: 'integer',
                default: 10
              }
            },
            {
              name: 'search',
              in: 'query',
              schema: {
                type: 'string'
              }
            },
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['Active', 'Expired', 'Cancelled', 'Pending']
              }
            },
            {
              name: 'insuranceType',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['Health', 'Life', 'Motor', 'Home', 'Travel', 'Business']
              }
            }
          ],
          responses: {
            200: {
              description: 'List of policies',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Policy'
                        }
                      },
                      pagination: {
                        $ref: '#/components/schemas/PaginationMeta'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Policies'],
          summary: 'Create new policy',
          description: 'Create a new insurance policy',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Policy'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Policy created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        $ref: '#/components/schemas/Policy'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      // Claims endpoints
      '/api/claims': {
        get: {
          tags: ['Claims'],
          summary: 'Get all claims',
          description: 'Get all claims with filtering and pagination',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: {
                type: 'integer',
                default: 1
              }
            },
            {
              name: 'limit',
              in: 'query',
              schema: {
                type: 'integer',
                default: 10
              }
            },
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Settled']
              }
            }
          ],
          responses: {
            200: {
              description: 'List of claims',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Claim'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Claims'],
          summary: 'Create new claim',
          description: 'Create a new insurance claim',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Claim'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Claim created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        $ref: '#/components/schemas/Claim'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      // Leads endpoints
      '/api/leads': {
        get: {
          tags: ['Leads'],
          summary: 'Get all leads',
          description: 'Get all leads with filtering and pagination',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: {
                type: 'integer',
                default: 1
              }
            },
            {
              name: 'limit',
              in: 'query',
              schema: {
                type: 'integer',
                default: 10
              }
            },
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['New', 'In Progress', 'Qualified', 'Not Interested', 'Converted', 'Lost']
              }
            },
            {
              name: 'source',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['Website', 'Referral', 'Cold Call', 'Social Media', 'Event', 'Advertisement', 'Other']
              }
            }
          ],
          responses: {
            200: {
              description: 'List of leads',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Lead'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Leads'],
          summary: 'Create new lead',
          description: 'Create a new lead record',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Lead'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Lead created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        $ref: '#/components/schemas/Lead'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      // Agents endpoints
      '/api/agents': {
        get: {
          tags: ['Agents'],
          summary: 'Get all agents',
          description: 'Get all agents with filtering and pagination',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: {
                type: 'integer',
                default: 1
              }
            },
            {
              name: 'limit',
              in: 'query',
              schema: {
                type: 'integer',
                default: 10
              }
            },
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['Active', 'Inactive', 'Suspended']
              }
            }
          ],
          responses: {
            200: {
              description: 'List of agents',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Agent'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Agents'],
          summary: 'Create new agent',
          description: 'Create a new agent record',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Agent'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Agent created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        $ref: '#/components/schemas/Agent'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      // Quotations endpoints
      '/api/quotations': {
        get: {
          tags: ['Quotations'],
          summary: 'Get all quotations',
          description: 'Get all quotations with filtering and pagination',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: {
                type: 'integer',
                default: 1
              }
            },
            {
              name: 'limit',
              in: 'query',
              schema: {
                type: 'integer',
                default: 10
              }
            },
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired']
              }
            }
          ],
          responses: {
            200: {
              description: 'List of quotations',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Quotation'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Quotations'],
          summary: 'Create new quotation',
          description: 'Create a new insurance quotation',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Quotation'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Quotation created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        $ref: '#/components/schemas/Quotation'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      // Activities endpoints
      '/api/activities': {
        get: {
          tags: ['Activities'],
          summary: 'Get all activities',
          description: 'Get all activities with filtering and pagination',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: {
                type: 'integer',
                default: 1
              }
            },
            {
              name: 'limit',
              in: 'query',
              schema: {
                type: 'integer',
                default: 50
              }
            },
            {
              name: 'type',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['client', 'policy', 'claim', 'lead', 'quotation', 'user']
              }
            },
            {
              name: 'dateFilter',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['today', 'yesterday', 'last7days', 'last30days', 'custom']
              }
            }
          ],
          responses: {
            200: {
              description: 'List of activities',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        type: 'object',
                        properties: {
                          activities: {
                            type: 'array',
                            items: {
                              $ref: '#/components/schemas/Activity'
                            }
                          },
                          pagination: {
                            $ref: '#/components/schemas/PaginationMeta'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/activities/stats': {
        get: {
          tags: ['Activities'],
          summary: 'Get activity statistics',
          description: 'Get activity statistics and metrics',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'timeframe',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['24h', '7d', '30d', '90d'],
                default: '24h'
              }
            }
          ],
          responses: {
            200: {
              description: 'Activity statistics',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        type: 'object',
                        properties: {
                          totalActivities: {
                            type: 'number',
                            example: 150
                          },
                          byType: {
                            type: 'object',
                            properties: {
                              client: {
                                type: 'number',
                                example: 50
                              },
                              policy: {
                                type: 'number',
                                example: 30
                              },
                              claim: {
                                type: 'number',
                                example: 20
                              }
                            }
                          },
                          byOperation: {
                            type: 'object',
                            properties: {
                              create: {
                                type: 'number',
                                example: 60
                              },
                              update: {
                                type: 'number',
                                example: 40
                              },
                              delete: {
                                type: 'number',
                                example: 10
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      // Broadcasts endpoints
      '/api/broadcast': {
        get: {
          tags: ['Broadcasts'],
          summary: 'Get all broadcasts',
          description: 'Get all broadcasts with filtering and pagination',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: {
                type: 'integer',
                default: 1
              }
            },
            {
              name: 'limit',
              in: 'query',
              schema: {
                type: 'integer',
                default: 10
              }
            },
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['Draft', 'Scheduled', 'Sent', 'Failed']
              }
            },
            {
              name: 'type',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['SMS', 'Email', 'WhatsApp', 'Push']
              }
            }
          ],
          responses: {
            200: {
              description: 'List of broadcasts',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Broadcast'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Broadcasts'],
          summary: 'Create new broadcast',
          description: 'Create a new broadcast message',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: {
                      type: 'string',
                      example: 'Health Insurance Promotion'
                    },
                    message: {
                      type: 'string',
                      example: 'Special offer on health insurance plans'
                    },
                    type: {
                      type: 'string',
                      enum: ['SMS', 'Email', 'WhatsApp', 'Push'],
                      example: 'Email'
                    },
                    targetAudience: {
                      type: 'array',
                      items: {
                        type: 'string'
                      },
                      example: ['All Clients']
                    },
                    scheduledAt: {
                      type: 'string',
                      format: 'date-time',
                      example: '2024-01-15T10:00:00Z'
                    }
                  },
                  required: ['title', 'message', 'type', 'targetAudience']
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Broadcast created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        $ref: '#/components/schemas/Broadcast'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/broadcast/eligible-clients': {
        post: {
          tags: ['Broadcasts'],
          summary: 'Get eligible clients',
          description: 'Get list of clients eligible for broadcast based on criteria',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    targetAudience: {
                      type: 'array',
                      items: {
                        type: 'string'
                      },
                      example: ['Health Insurance Clients']
                    },
                    filters: {
                      type: 'object',
                      properties: {
                        insuranceType: {
                          type: 'string',
                          example: 'Health'
                        },
                        status: {
                          type: 'string',
                          example: 'Active'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'List of eligible clients',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Client'
                        }
                      },
                      totalCount: {
                        type: 'number',
                        example: 25
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      // Communication endpoints
      '/api/communication': {
        get: {
          tags: ['Communication'],
          summary: 'Get communications',
          description: 'Get all communications with filtering',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'List of communications',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            _id: {
                              type: 'string'
                            },
                            type: {
                              type: 'string',
                              enum: ['SMS', 'Email', 'WhatsApp', 'Call']
                            },
                            recipient: {
                              type: 'string'
                            },
                            message: {
                              type: 'string'
                            },
                            status: {
                              type: 'string',
                              enum: ['Sent', 'Delivered', 'Failed', 'Pending']
                            },
                            sentAt: {
                              type: 'string',
                              format: 'date-time'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Communication'],
          summary: 'Send communication',
          description: 'Send a new communication message',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      enum: ['SMS', 'Email', 'WhatsApp', 'Call']
                    },
                    recipient: {
                      type: 'string'
                    },
                    message: {
                      type: 'string'
                    },
                    clientId: {
                      type: 'string'
                    }
                  },
                  required: ['type', 'recipient', 'message']
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Communication sent successfully'
            }
          }
        }
      },
      '/api/communication/offers': {
        get: {
          tags: ['Communication'],
          summary: 'Get offers',
          description: 'Get all available offers',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'List of offers',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Offer'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Communication'],
          summary: 'Create offer',
          description: 'Create a new offer',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Offer'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Offer created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        $ref: '#/components/schemas/Offer'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      // Invoices endpoints
      '/api/invoices': {
        get: {
          tags: ['Invoices'],
          summary: 'Get all invoices',
          description: 'Get all invoices with filtering and pagination',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: {
                type: 'integer',
                default: 1
              }
            },
            {
              name: 'limit',
              in: 'query',
              schema: {
                type: 'integer',
                default: 10
              }
            },
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled']
              }
            }
          ],
          responses: {
            200: {
              description: 'List of invoices',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Invoice'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Invoices'],
          summary: 'Create new invoice',
          description: 'Create a new invoice',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Invoice'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Invoice created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        $ref: '#/components/schemas/Invoice'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      // Roles endpoints
      '/api/roles': {
        get: {
          tags: ['Roles'],
          summary: 'Get all roles',
          description: 'Get all roles with optional permissions',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'include_permissions',
              in: 'query',
              schema: {
                type: 'boolean',
                default: false
              },
              description: 'Include permission details'
            }
          ],
          responses: {
            200: {
              description: 'List of roles',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Role'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/roles/{id}': {
        get: {
          tags: ['Roles'],
          summary: 'Get role by ID',
          description: 'Get a specific role by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            200: {
              description: 'Role details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        $ref: '#/components/schemas/Role'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/roles/{id}/permissions': {
        get: {
          tags: ['Roles'],
          summary: 'Get role permissions',
          description: 'Get permissions for a specific role',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            200: {
              description: 'Role permissions',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        type: 'array',
                        items: {
                          type: 'string'
                        },
                        example: ['create_users', 'delete_users', 'manage_roles']
                      }
                    }
                  }
                }
              }
            }
          }
        },
        put: {
          tags: ['Roles'],
          summary: 'Update role permissions',
          description: 'Update permissions for a specific role',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    permissions: {
                      type: 'array',
                      items: {
                        type: 'string'
                      },
                      example: ['create_users', 'update_users', 'view_reports']
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Permissions updated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Success'
                  }
                }
              }
            }
          }
        }
      },
      // Settings endpoints
      '/api/settings': {
        get: {
          tags: ['Settings'],
          summary: 'Get user settings',
          description: 'Get current user settings',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'User settings',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        type: 'object',
                        properties: {
                          notifications: {
                            type: 'object',
                            properties: {
                              email: {
                                type: 'boolean',
                                example: true
                              },
                              sms: {
                                type: 'boolean',
                                example: false
                              },
                              push: {
                                type: 'boolean',
                                example: true
                              }
                            }
                          },
                          privacy: {
                            type: 'object',
                            properties: {
                              profileVisibility: {
                                type: 'string',
                                enum: ['public', 'private', 'team'],
                                example: 'team'
                              }
                            }
                          },
                          preferences: {
                            type: 'object',
                            properties: {
                              language: {
                                type: 'string',
                                example: 'en'
                              },
                              timezone: {
                                type: 'string',
                                example: 'UTC'
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        put: {
          tags: ['Settings'],
          summary: 'Update user settings',
          description: 'Update current user settings',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    notifications: {
                      type: 'object'
                    },
                    privacy: {
                      type: 'object'
                    },
                    preferences: {
                      type: 'object'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Settings updated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Success'
                  }
                }
              }
            }
          }
        }
      },
      // Header endpoints
      '/api/header/profile': {
        get: {
          tags: ['Header'],
          summary: 'Get header profile data',
          description: 'Get user profile data for header display',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Header profile data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        type: 'object',
                        properties: {
                          name: {
                            type: 'string',
                            example: 'John Doe'
                          },
                          email: {
                            type: 'string',
                            example: 'john.doe@company.com'
                          },
                          role: {
                            type: 'string',
                            example: 'Agent'
                          },
                          avatar: {
                            type: 'string',
                            example: 'https://example.com/avatar.jpg'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/header/notifications': {
        get: {
          tags: ['Header'],
          summary: 'Get notifications',
          description: 'Get notifications for header dropdown',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'List of notifications',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            _id: {
                              type: 'string'
                            },
                            title: {
                              type: 'string',
                              example: 'New claim submitted'
                            },
                            message: {
                              type: 'string',
                              example: 'A new claim has been submitted for review'
                            },
                            type: {
                              type: 'string',
                              enum: ['info', 'warning', 'success', 'error']
                            },
                            isRead: {
                              type: 'boolean',
                              example: false
                            },
                            createdAt: {
                              type: 'string',
                              format: 'date-time'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      // Health check
      '/api/health': {
        get: {
          tags: ['System'],
          summary: 'System health check',
          description: 'Check system health and status',
          responses: {
            200: {
              description: 'System is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: {
                        type: 'string',
                        example: 'OK'
                      },
                      timestamp: {
                        type: 'string',
                        format: 'date-time'
                      },
                      uptime: {
                        type: 'number',
                        example: 12345.67
                      },
                      version: {
                        type: 'string',
                        example: '1.0.0'
                      },
                      environment: {
                        type: 'string',
                        example: 'development'
                      },
                      database: {
                        type: 'string',
                        enum: ['connected', 'disconnected'],
                        example: 'connected'
                      }
                    }
                  }
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
    './controllers/*.js',
    './models/*.js'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerSpec
};
