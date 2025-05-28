
import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS } from '../../config/api.js';

/**
 * Claims API Service
 * Handles all claim-related API requests with offline fallback
 * Optimized for MongoDB/Node.js/Express backend integration
 */

// Mock data for offline mode - matches MongoDB document structure
const mockClaimsData = [
  {
    _id: '674d8f2b5a8c9d123456789a',
    claimNumber: 'CLM-2024-001',
    insuranceCompanyClaimId: null,
    clientId: '1',
    clientName: 'John Doe',
    memberId: '1',
    memberName: 'John Doe',
    policyId: '1',
    policyNumber: 'POL-2024-001',
    policyType: 'Health',
    insuranceCompanyPolicyNumber: 'IC-POL-2024-001',
    dateOfIncident: '2024-11-15',
    dateOfFiling: '2024-11-20',
    claimAmount: 50000,
    approvedAmount: null,
    status: 'pending',
    incidentDescription: 'Medical treatment for fever and cold',
    documents: 3,
    documentsList: ['medical_report.pdf', 'prescription.pdf', 'bills.pdf'],
    notes: [],
    timeline: [
      {
        action: 'Filed',
        by: 'John Doe',
        timestamp: '2024-11-20T10:00:00.000Z',
        details: 'Claim filed for medical treatment'
      }
    ],
    createdAt: '2024-11-20T10:00:00.000Z',
    updatedAt: '2024-11-20T10:00:00.000Z',
    createdBy: 'client',
    assignedAgent: 'Agent Smith'
  },
  {
    _id: '674d8f2b5a8c9d123456789b',
    claimNumber: 'CLM-2024-002',
    insuranceCompanyClaimId: 'IC-CLM-2024-002',
    clientId: '2',
    clientName: 'Jane Smith',
    memberId: '2',
    memberName: 'Jane Smith',
    policyId: '2',
    policyNumber: 'POL-2024-002',
    policyType: 'Vehicle',
    insuranceCompanyPolicyNumber: 'IC-POL-2024-002',
    dateOfIncident: '2024-11-10',
    dateOfFiling: '2024-11-12',
    claimAmount: 75000,
    approvedAmount: 70000,
    status: 'approved',
    incidentDescription: 'Vehicle accident on highway',
    documents: 5,
    documentsList: ['police_report.pdf', 'damage_photos.jpg', 'estimate.pdf', 'driver_license.pdf', 'insurance_card.pdf'],
    notes: [
      {
        id: '1',
        content: 'Initial assessment completed',
        createdBy: 'Agent Johnson',
        createdAt: '2024-11-13T09:00:00.000Z'
      }
    ],
    timeline: [
      {
        action: 'Filed',
        by: 'Jane Smith',
        timestamp: '2024-11-12T14:30:00.000Z',
        details: 'Claim filed for vehicle accident'
      },
      {
        action: 'Under Review',
        by: 'Agent Johnson',
        timestamp: '2024-11-13T09:00:00.000Z',
        details: 'Claim moved to review'
      },
      {
        action: 'Approved',
        by: 'Manager',
        timestamp: '2024-11-18T16:00:00.000Z',
        details: 'Claim approved for ₹70,000'
      }
    ],
    createdAt: '2024-11-12T14:30:00.000Z',
    updatedAt: '2024-11-18T16:00:00.000Z',
    createdBy: 'client',
    assignedAgent: 'Agent Johnson'
  },
  {
    _id: '674d8f2b5a8c9d123456789c',
    claimNumber: 'CLM-2024-003',
    insuranceCompanyClaimId: 'IC-CLM-2024-003',
    clientId: '3',
    clientName: 'Acme Corp',
    memberId: '5',
    memberName: 'Employee Name',
    policyId: '3',
    policyNumber: 'POL-2024-003',
    policyType: 'Property',
    insuranceCompanyPolicyNumber: 'IC-POL-2024-003',
    dateOfIncident: '2024-11-05',
    dateOfFiling: '2024-11-07',
    claimAmount: 200000,
    approvedAmount: 0,
    status: 'rejected',
    incidentDescription: 'Fire damage to office equipment',
    documents: 4,
    documentsList: ['fire_report.pdf', 'damage_assessment.pdf', 'equipment_list.xlsx', 'photos.zip'],
    notes: [
      {
        id: '1',
        content: 'Initial investigation shows negligence',
        createdBy: 'Investigator',
        createdAt: '2024-11-10T11:00:00.000Z'
      },
      {
        id: '2',
        content: 'Claim rejected due to policy violation',
        createdBy: 'Manager',
        createdAt: '2024-11-15T15:30:00.000Z'
      }
    ],
    timeline: [
      {
        action: 'Filed',
        by: 'Acme Corp Admin',
        timestamp: '2024-11-07T08:00:00.000Z',
        details: 'Claim filed for fire damage'
      },
      {
        action: 'Under Investigation',
        by: 'Investigator',
        timestamp: '2024-11-08T10:00:00.000Z',
        details: 'Investigation initiated'
      },
      {
        action: 'Rejected',
        by: 'Manager',
        timestamp: '2024-11-15T15:30:00.000Z',
        details: 'Claim rejected due to policy violation'
      }
    ],
    createdAt: '2024-11-07T08:00:00.000Z',
    updatedAt: '2024-11-15T15:30:00.000Z',
    createdBy: 'client',
    assignedAgent: 'Agent Smith'
  }
];

class ClaimsApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
    this.isOfflineMode = false;
  }

  /**
   * Generic request method with retry logic and offline fallback
   * Optimized for Express.js backend integration
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add timeout to the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        this.isOfflineMode = false;
        return await response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        
        console.warn(`API Request failed (attempt ${attempt}):`, error.message);
        
        if (attempt === this.retryAttempts) {
          console.warn('API Request failed, using offline mode:', error.message);
          this.isOfflineMode = true;
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  /**
   * Offline fallback methods using localStorage and mock data
   * Data structure optimized for MongoDB documents
   */
  getOfflineClaims() {
    try {
      const stored = localStorage.getItem('claimsData');
      return stored ? JSON.parse(stored) : mockClaimsData;
    } catch (error) {
      console.error('Error reading offline claims:', error);
      return mockClaimsData;
    }
  }

  saveOfflineClaims(claims) {
    try {
      localStorage.setItem('claimsData', JSON.stringify(claims));
    } catch (error) {
      console.error('Error saving offline claims:', error);
    }
  }

  /**
   * Get claims with filtering, sorting, and pagination
   * API endpoint: GET /api/claims
   */
  async getClaims(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Pagination parameters
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Filtering parameters
      if (params.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params.policyType && params.policyType !== 'all') queryParams.append('policyType', params.policyType);
      if (params.clientId) queryParams.append('clientId', params.clientId);
      if (params.policyId) queryParams.append('policyId', params.policyId);
      if (params.searchTerm) queryParams.append('search', params.searchTerm);
      
      // Date filtering
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      
      // Sorting parameters
      if (params.sortField) queryParams.append('sortField', params.sortField);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

      const endpoint = `${API_ENDPOINTS.CLAIMS}?${queryParams.toString()}`;
      return await this.request(endpoint);
    } catch (error) {
      // Offline fallback with filtering simulation
      const claims = this.getOfflineClaims();
      let filteredClaims = [...claims];
      
      // Apply filters
      if (params.status && params.status !== 'all') {
        filteredClaims = filteredClaims.filter(c => 
          c.status.toLowerCase() === params.status.toLowerCase()
        );
      }
      
      if (params.policyType && params.policyType !== 'all') {
        filteredClaims = filteredClaims.filter(c => 
          c.policyType.toLowerCase() === params.policyType.toLowerCase()
        );
      }
      
      if (params.searchTerm) {
        const searchTerm = params.searchTerm.toLowerCase();
        filteredClaims = filteredClaims.filter(c => 
          c.claimNumber?.toLowerCase().includes(searchTerm) ||
          c.clientName?.toLowerCase().includes(searchTerm) ||
          c.memberName?.toLowerCase().includes(searchTerm) ||
          c.policyNumber?.toLowerCase().includes(searchTerm) ||
          c.incidentDescription?.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply sorting
      if (params.sortField) {
        filteredClaims.sort((a, b) => {
          const aVal = a[params.sortField];
          const bVal = b[params.sortField];
          
          if (params.sortDirection === 'desc') {
            return bVal > aVal ? 1 : -1;
          }
          return aVal > bVal ? 1 : -1;
        });
      }
      
      // Apply pagination
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return {
        data: filteredClaims.slice(startIndex, endIndex),
        total: filteredClaims.length,
        page,
        limit,
        totalPages: Math.ceil(filteredClaims.length / limit),
        success: true
      };
    }
  }

  /**
   * Get claim by ID
   * API endpoint: GET /api/claims/:id
   */
  async getClaimById(claimId) {
    try {
      const endpoint = `${API_ENDPOINTS.CLAIMS}/${claimId}`;
      return await this.request(endpoint);
    } catch (error) {
      // Offline fallback
      const claims = this.getOfflineClaims();
      const claim = claims.find(c => c._id?.toString() === claimId?.toString());
      
      if (!claim) {
        throw new Error(`Claim with ID ${claimId} not found`);
      }
      
      return claim;
    }
  }

  /**
   * Create new claim
   * API endpoint: POST /api/claims
   */
  async createClaim(claimData) {
    try {
      return await this.request(API_ENDPOINTS.CLAIMS, {
        method: 'POST',
        body: JSON.stringify(claimData),
      });
    } catch (error) {
      // Offline fallback
      const claims = this.getOfflineClaims();
      const newId = new Date().getTime().toString();
      const claimNumber = `CLM-${new Date().getFullYear()}-${String(claims.length + 1).padStart(3, '0')}`;
      
      const newClaim = {
        _id: newId,
        claimNumber,
        insuranceCompanyClaimId: null,
        ...claimData,
        status: claimData.status || 'pending',
        documents: 0,
        documentsList: [],
        notes: [],
        timeline: [
          {
            action: 'Filed',
            by: claimData.createdBy || 'User',
            timestamp: new Date().toISOString(),
            details: 'Claim filed'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      claims.push(newClaim);
      this.saveOfflineClaims(claims);
      
      return newClaim;
    }
  }

  /**
   * Update existing claim
   * API endpoint: PUT /api/claims/:id
   */
  async updateClaim(claimId, claimData) {
    try {
      const endpoint = `${API_ENDPOINTS.CLAIMS}/${claimId}`;
      return await this.request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(claimData),
      });
    } catch (error) {
      // Offline fallback
      const claims = this.getOfflineClaims();
      const claimIndex = claims.findIndex(c => c._id?.toString() === claimId?.toString());
      
      if (claimIndex === -1) {
        throw new Error(`Claim with ID ${claimId} not found`);
      }
      
      const updatedClaim = {
        ...claims[claimIndex],
        ...claimData,
        _id: claims[claimIndex]._id, // Preserve original ID
        updatedAt: new Date().toISOString()
      };
      
      claims[claimIndex] = updatedClaim;
      this.saveOfflineClaims(claims);
      
      return updatedClaim;
    }
  }

  /**
   * Delete claim
   * API endpoint: DELETE /api/claims/:id
   */
  async deleteClaim(claimId) {
    try {
      const endpoint = `${API_ENDPOINTS.CLAIMS}/${claimId}`;
      return await this.request(endpoint, {
        method: 'DELETE',
      });
    } catch (error) {
      // Offline fallback
      const claims = this.getOfflineClaims();
      const claimIndex = claims.findIndex(c => c._id?.toString() === claimId?.toString());
      
      if (claimIndex === -1) {
        throw new Error(`Claim with ID ${claimId} not found`);
      }
      
      claims.splice(claimIndex, 1);
      this.saveOfflineClaims(claims);
      
      return { success: true };
    }
  }

  /**
   * Upload claim document
   * API endpoint: POST /api/claims/:id/documents
   */
  async uploadDocument(claimId, documentType, file) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);

    try {
      return await this.request(`${API_ENDPOINTS.CLAIMS}/${claimId}/documents`, {
        method: 'POST',
        headers: {}, // Remove Content-Type to let browser set it for FormData
        body: formData,
      });
    } catch (error) {
      // Offline fallback - simulate successful upload
      return {
        success: true,
        document: {
          _id: new Date().getTime().toString(),
          filename: file.name,
          documentType,
          uploadedAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get claim documents
   * API endpoint: GET /api/claims/:id/documents
   */
  async getClaimDocuments(claimId) {
    try {
      const endpoint = `${API_ENDPOINTS.CLAIMS}/${claimId}/documents`;
      return await this.request(endpoint);
    } catch (error) {
      // Offline fallback
      const claims = this.getOfflineClaims();
      const claim = claims.find(c => c._id?.toString() === claimId?.toString());
      
      return {
        data: claim?.documentsList || [],
        total: claim?.documents || 0
      };
    }
  }

  /**
   * Delete claim document
   * API endpoint: DELETE /api/claims/:claimId/documents/:documentId
   */
  async deleteDocument(claimId, documentId) {
    try {
      const endpoint = `${API_ENDPOINTS.CLAIMS}/${claimId}/documents/${documentId}`;
      return await this.request(endpoint, {
        method: 'DELETE',
      });
    } catch (error) {
      // Offline fallback
      return { success: true };
    }
  }

  /**
   * Add claim note
   * API endpoint: POST /api/claims/:id/notes
   */
  async addNote(claimId, noteData) {
    try {
      const endpoint = `${API_ENDPOINTS.CLAIMS}/${claimId}/notes`;
      return await this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(noteData),
      });
    } catch (error) {
      // Offline fallback
      const claims = this.getOfflineClaims();
      const claimIndex = claims.findIndex(c => c._id?.toString() === claimId?.toString());
      
      if (claimIndex !== -1) {
        const newNote = {
          id: new Date().getTime().toString(),
          ...noteData,
          createdAt: new Date().toISOString()
        };
        
        claims[claimIndex].notes = claims[claimIndex].notes || [];
        claims[claimIndex].notes.push(newNote);
        this.saveOfflineClaims(claims);
        
        return newNote;
      }
      
      throw new Error(`Claim with ID ${claimId} not found`);
    }
  }

  /**
   * Update claim status
   * API endpoint: PATCH /api/claims/:id/status
   */
  async updateClaimStatus(claimId, status, reason = '') {
    try {
      const endpoint = `${API_ENDPOINTS.CLAIMS}/${claimId}/status`;
      return await this.request(endpoint, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason }),
      });
    } catch (error) {
      // Offline fallback
      const claims = this.getOfflineClaims();
      const claimIndex = claims.findIndex(c => c._id?.toString() === claimId?.toString());
      
      if (claimIndex !== -1) {
        claims[claimIndex].status = status;
        claims[claimIndex].updatedAt = new Date().toISOString();
        
        // Add to timeline
        claims[claimIndex].timeline = claims[claimIndex].timeline || [];
        claims[claimIndex].timeline.push({
          action: status.charAt(0).toUpperCase() + status.slice(1),
          by: 'User',
          timestamp: new Date().toISOString(),
          details: reason || `Status changed to ${status}`
        });
        
        this.saveOfflineClaims(claims);
        return claims[claimIndex];
      }
      
      throw new Error(`Claim with ID ${claimId} not found`);
    }
  }

  /**
   * Get claims statistics
   * API endpoint: GET /api/claims/stats
   */
  async getClaimsStats(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      
      const endpoint = `${API_ENDPOINTS.CLAIMS}/stats?${queryParams.toString()}`;
      return await this.request(endpoint);
    } catch (error) {
      // Offline fallback
      const claims = this.getOfflineClaims();
      
      return {
        total: claims.length,
        pending: claims.filter(c => c.status === 'pending').length,
        approved: claims.filter(c => c.status === 'approved').length,
        rejected: claims.filter(c => c.status === 'rejected').length,
        settled: claims.filter(c => c.status === 'settled').length,
        totalAmount: claims.reduce((sum, c) => sum + (c.claimAmount || 0), 0),
        approvedAmount: claims.reduce((sum, c) => sum + (c.approvedAmount || 0), 0)
      };
    }
  }
}

// Export singleton instance
export const claimsApi = new ClaimsApiService();
