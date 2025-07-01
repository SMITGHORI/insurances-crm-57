const express = require('express');
const router = express.Router();

// Import middleware
const authMiddleware = require('../middleware/auth');
const { roleMiddleware, resourceOwnershipMiddleware } = require('../middleware/roleMiddleware');
const { validationMiddleware } = require('../middleware/validation');

// Import validation schemas
const {
  createLeadSchema,
  updateLeadSchema,
  followUpSchema,
  noteSchema,
  assignmentSchema,
  queryParamsSchema
} = require('../validations/leadValidation');

// Import controllers
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  addFollowUp,
  addNote,
  assignLead,
  convertToClient,
  getLeadsStats,
  searchLeads,
  getStaleLeads,
  getLeadFunnelReport
} = require('../controllers/leadController');

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/leads:
 *   get:
 *     summary: Get all leads with filtering and pagination
 *     description: Retrieve a paginated list of leads with optional filtering by status, source, priority, assigned agent, and search functionality. Agents can only see their assigned leads, while managers and super admins can see all leads.
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of leads per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [New, In Progress, Qualified, Not Interested, Converted, Lost]
 *         description: Filter by lead status
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [Website, Referral, Cold Call, Social Media, Event, Advertisement, Other]
 *         description: Filter by lead source
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [High, Medium, Low]
 *         description: Filter by lead priority
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filter by assigned agent ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in lead name, email, phone, or leadId
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, name, priority, status]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Successfully retrieved leads
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lead'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get('/',
  validationMiddleware(queryParamsSchema, 'query'),
  resourceOwnershipMiddleware(),
  getLeads
);

/**
 * @route   GET /api/leads/stats
 * @desc    Get leads statistics
 * @access  Private (All authenticated users)
 * @query   period, agentId
 */
router.get('/stats',
  resourceOwnershipMiddleware(),
  getLeadsStats
);

/**
 * @route   GET /api/leads/search/:query
 * @desc    Search leads by text
 * @access  Private (All authenticated users)
 * @param   query - Search query string
 * @query   limit
 */
router.get('/search/:query',
  resourceOwnershipMiddleware(),
  searchLeads
);

/**
 * @route   GET /api/leads/stale
 * @desc    Get stale leads (no activity for specified days)
 * @access  Private (All authenticated users)
 * @query   days - Number of days to consider stale (default: 7)
 */
router.get('/stale',
  resourceOwnershipMiddleware(),
  getStaleLeads
);

/**
 * @route   GET /api/leads/funnel-report
 * @desc    Get lead funnel report
 * @access  Private (Managers, Super Admin)
 * @query   period, agentId
 */
router.get('/funnel-report',
  roleMiddleware(['manager', 'super_admin']),
  resourceOwnershipMiddleware(),
  getLeadFunnelReport
);

/**
 * @swagger
 * /api/leads:
 *   post:
 *     summary: Create a new lead
 *     description: Create a new lead in the system. Only agents, managers, and super admins can create leads. The leadId is auto-generated.
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - email
 *               - source
 *               - product
 *               - assignedTo
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Full name of the lead
 *                 example: "John Doe"
 *               phone:
 *                 type: string
 *                 pattern: '^\+?[\d\s\-\(\)]{10,15}$'
 *                 description: Phone number of the lead
 *                 example: "+1234567890"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the lead
 *                 example: "john.doe@email.com"
 *               address:
 *                 type: string
 *                 maxLength: 500
 *                 description: Physical address of the lead
 *                 example: "123 Main St, City, State 12345"
 *               source:
 *                 type: string
 *                 enum: [Website, Referral, Cold Call, Social Media, Event, Advertisement, Other]
 *                 description: Source from which the lead was generated
 *                 example: "Website"
 *               product:
 *                 type: string
 *                 enum: [Health Insurance, Life Insurance, Motor Insurance, Home Insurance, Travel Insurance, Business Insurance]
 *                 description: Type of insurance product the lead is interested in
 *                 example: "Health Insurance"
 *               budget:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 10000000
 *                 description: Budget range of the lead
 *                 example: 5000
 *               assignedTo:
 *                 type: object
 *                 required:
 *                   - agentId
 *                   - name
 *                 properties:
 *                   agentId:
 *                     type: string
 *                     description: MongoDB ObjectId of the assigned agent
 *                     example: "507f1f77bcf86cd799439012"
 *                   name:
 *                     type: string
 *                     description: Name of the assigned agent
 *                     example: "Agent Smith"
 *               priority:
 *                 type: string
 *                 enum: [High, Medium, Low]
 *                 description: Priority level of the lead
 *                 example: "Medium"
 *               additionalInfo:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Additional information about the lead
 *                 example: "Customer is interested in family health insurance"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 50
 *                 description: Tags associated with the lead
 *                 example: ["hot-lead", "family-insurance"]
 *     responses:
 *       201:
 *         description: Lead created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Lead created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Lead'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/',
  roleMiddleware(['agent', 'manager', 'super_admin']),
  validationMiddleware(createLeadSchema),
  createLead
);

/**
 * @route   GET /api/leads/:id
 * @desc    Get lead by ID
 * @access  Private (All authenticated users)
 * @param   id - Lead ID
 */
router.get('/:id',
  resourceOwnershipMiddleware(),
  getLeadById
);

/**
 * @route   PUT /api/leads/:id
 * @desc    Update lead
 * @access  Private (Agents can update assigned leads, Managers/Super Admin can update all)
 * @param   id - Lead ID
 * @body    Lead update data according to updateLeadSchema
 */
router.put('/:id',
  roleMiddleware(['agent', 'manager', 'super_admin']),
  validationMiddleware(updateLeadSchema),
  resourceOwnershipMiddleware(),
  updateLead
);

/**
 * @route   DELETE /api/leads/:id
 * @desc    Delete lead
 * @access  Private (Managers, Super Admin only)
 * @param   id - Lead ID
 */
router.delete('/:id',
  roleMiddleware(['manager', 'super_admin']),
  resourceOwnershipMiddleware(),
  deleteLead
);

/**
 * @route   POST /api/leads/:id/followups
 * @desc    Add follow-up to lead
 * @access  Private (Agents can add to assigned leads, Managers/Super Admin can add to all)
 * @param   id - Lead ID
 * @body    Follow-up data according to followUpSchema
 */
router.post('/:id/followups',
  roleMiddleware(['agent', 'manager', 'super_admin']),
  validationMiddleware(followUpSchema),
  resourceOwnershipMiddleware(),
  addFollowUp
);

/**
 * @route   POST /api/leads/:id/notes
 * @desc    Add note to lead
 * @access  Private (Agents can add to assigned leads, Managers/Super Admin can add to all)
 * @param   id - Lead ID
 * @body    Note data according to noteSchema
 */
router.post('/:id/notes',
  roleMiddleware(['agent', 'manager', 'super_admin']),
  validationMiddleware(noteSchema),
  resourceOwnershipMiddleware(),
  addNote
);

/**
 * @swagger
 * /api/leads/{id}/assign:
 *   put:
 *     summary: Assign lead to agent
 *     description: Assign a lead to a specific agent. Only managers and super admins can perform this action. This demonstrates RBAC (Role-Based Access Control) middleware usage.
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the lead
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agentId
 *               - agentName
 *             properties:
 *               agentId:
 *                 type: string
 *                 description: MongoDB ObjectId of the agent to assign
 *                 example: "507f1f77bcf86cd799439012"
 *               agentName:
 *                 type: string
 *                 description: Name of the agent to assign
 *                 example: "Agent Smith"
 *     responses:
 *       200:
 *         description: Lead assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Lead assigned successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Lead'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Insufficient permissions - Only managers and super admins can assign leads
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Access denied. Only managers and super admins can assign leads."
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id/assign',
  roleMiddleware(['manager', 'super_admin']),
  validationMiddleware(assignmentSchema),
  assignLead
);

/**
 * @route   POST /api/leads/:id/convert
 * @desc    Convert lead to client
 * @access  Private (Agents can convert assigned leads, Managers/Super Admin can convert all)
 * @param   id - Lead ID
 */
router.post('/:id/convert',
  roleMiddleware(['agent', 'manager', 'super_admin']),
  resourceOwnershipMiddleware(),
  convertToClient
);

module.exports = router;
