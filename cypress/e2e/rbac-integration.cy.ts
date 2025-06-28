
describe('RBAC Integration Tests', () => {
  beforeEach(() => {
    // Visit the login page
    cy.visit('/auth');
  });

  describe('Super Admin Role', () => {
    beforeEach(() => {
      // Login as super admin
      cy.get('[data-testid="email-input"]').type('admin@ambainsurance.com');
      cy.get('[data-testid="password-input"]').type('admin123');
      cy.get('[data-testid="login-button"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should be able to edit role permissions and see immediate effect', () => {
      // Navigate to settings
      cy.get('[data-testid="sidebar"]').contains('Settings').click();
      
      // Go to permissions tab
      cy.get('[data-testid="settings-tabs"]').contains('Permissions').click();
      
      // Select agent role
      cy.get('[data-testid="role-selector"]').click();
      cy.contains('Sales Agent').click();
      
      // Toggle a permission (e.g., clients:delete)
      cy.get('[data-testid="permission-matrix"]')
        .find('[data-module="clients"][data-action="delete"]')
        .find('input[type="checkbox"]')
        .as('deleteCheckbox');
      
      // Check current state and toggle
      cy.get('@deleteCheckbox').then(($checkbox) => {
        const wasChecked = $checkbox.prop('checked');
        cy.get('@deleteCheckbox').click();
        
        // Save changes
        cy.get('[data-testid="save-permissions"]').click();
        
        // Verify success message
        cy.contains('permissions updated successfully').should('be.visible');
        
        // Verify the change persisted
        cy.get('@deleteCheckbox').should(wasChecked ? 'not.be.checked' : 'be.checked');
      });
    });

    it('should see all navigation items', () => {
      cy.get('[data-testid="sidebar"]').within(() => {
        cy.contains('Clients').should('be.visible');
        cy.contains('Policies').should('be.visible');
        cy.contains('Claims').should('be.visible');
        cy.contains('Leads').should('be.visible');
        cy.contains('Agents').should('be.visible');
        cy.contains('Invoices').should('be.visible');
        cy.contains('Reports').should('be.visible');
        cy.contains('Settings').should('be.visible');
      });
    });
  });

  describe('Agent Role', () => {
    beforeEach(() => {
      // Login as agent
      cy.get('[data-testid="email-input"]').type('agent@ambainsurance.com');
      cy.get('[data-testid="password-input"]').type('agent123');
      cy.get('[data-testid="login-button"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should have limited navigation access', () => {
      cy.get('[data-testid="sidebar"]').within(() => {
        cy.contains('Clients').should('be.visible');
        cy.contains('Policies').should('be.visible');
        cy.contains('Leads').should('be.visible');
        // Should not see admin-only items
        cy.contains('Agents').should('not.exist');
        cy.contains('Invoices').should('not.exist');
      });
    });

    it('should be denied access to unauthorized routes', () => {
      cy.visit('/agents');
      cy.contains('Access Denied').should('be.visible');
      cy.contains('You need agents:view permission').should('be.visible');
      cy.get('[data-testid="back-to-dashboard"]').should('be.visible');
    });

    it('should see real-time permission updates', () => {
      // This test requires setting up WebSocket mocking or test environment
      // For now, we'll test that the permission system responds to context changes
      
      cy.visit('/clients');
      
      // Simulate permission update via window event
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('permission-update', {
          detail: { userId: 'agent-id', newPermissions: ['clients:delete'] }
        }));
      });
      
      // Wait for potential UI updates
      cy.wait(1000);
      
      // Check if new permissions are reflected (this would require mock setup)
      // In a real scenario, this would test WebSocket integration
    });
  });

  describe('Real-time Permission Updates', () => {
    it('should update agent UI when super admin changes permissions', () => {
      // This is a complex E2E test that would require:
      // 1. Two browser contexts (super admin and agent)
      // 2. WebSocket server setup
      // 3. Real-time permission synchronization
      
      // For now, this serves as a placeholder for the full implementation
      cy.log('Real-time permission updates - requires WebSocket setup');
    });
  });

  describe('Branch-based Access Control', () => {
    beforeEach(() => {
      // Login as branch-specific user
      cy.get('[data-testid="email-input"]').type('branch-agent@ambainsurance.com');
      cy.get('[data-testid="password-input"]').type('branch123');
      cy.get('[data-testid="login-button"]').click();
    });

    it('should only show records from same branch', () => {
      cy.visit('/clients');
      
      // Verify all visible clients belong to the same branch
      cy.get('[data-testid="clients-table"] tbody tr').each(($row) => {
        cy.wrap($row).find('[data-testid="client-branch"]').should('contain', 'Main Branch');
      });
    });

    it('should deny access to different branch records', () => {
      // Try to access a client from a different branch
      cy.visit('/clients/different-branch-client-id');
      cy.contains('Access Denied').should('be.visible');
      cy.contains('Branch restriction applies').should('be.visible');
    });
  });
});
