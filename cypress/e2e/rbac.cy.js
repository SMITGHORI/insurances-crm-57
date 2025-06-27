
describe('RBAC End-to-End Tests', () => {
  beforeEach(() => {
    // Visit the login page
    cy.visit('/auth');
  });

  describe('Super Admin Role', () => {
    beforeEach(() => {
      // Login as super admin
      cy.get('[data-testid="email-input"]').type('superadmin@amba.com');
      cy.get('[data-testid="password-input"]').type('admin123');
      cy.get('[data-testid="login-button"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should have access to all navigation items', () => {
      // Check all sidebar navigation items are visible
      cy.get('[data-testid="sidebar"]').within(() => {
        cy.contains('Clients').should('be.visible');
        cy.contains('Policies').should('be.visible');
        cy.contains('Claims').should('be.visible');
        cy.contains('Leads').should('be.visible');
        cy.contains('Agents').should('be.visible');
        cy.contains('Invoices').should('be.visible');
        cy.contains('Reports').should('be.visible');
      });
    });

    it('should be able to access all protected routes', () => {
      const protectedRoutes = ['/clients', '/policies', '/claims', '/leads', '/agents'];
      
      protectedRoutes.forEach(route => {
        cy.visit(route);
        cy.url().should('include', route);
        cy.contains('Access Denied').should('not.exist');
      });
    });

    it('should see all action buttons in clients table', () => {
      cy.visit('/clients');
      cy.get('[data-testid="clients-table"]').within(() => {
        cy.get('[data-testid="create-client-button"]').should('be.visible');
        cy.get('[data-testid="client-actions-menu"]').first().click();
        cy.contains('Edit Client').should('be.visible');
        cy.contains('Delete Client').should('be.visible');
      });
    });
  });

  describe('Agent Role', () => {
    beforeEach(() => {
      // Login as agent
      cy.get('[data-testid="email-input"]').type('agent@amba.com');
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

    it('should be redirected when accessing admin routes', () => {
      cy.visit('/agents');
      cy.contains('Access Denied').should('be.visible');
      cy.contains('Return to Dashboard').should('be.visible');
    });

    it('should have limited actions in clients table', () => {
      cy.visit('/clients');
      cy.get('[data-testid="clients-table"]').within(() => {
        // Should not see create button for agents
        cy.get('[data-testid="create-client-button"]').should('not.exist');
        
        // Should see limited actions in dropdown
        cy.get('[data-testid="client-actions-menu"]').first().click();
        cy.contains('Edit Client').should('be.visible');
        cy.contains('Delete Client').should('not.exist');
      });
    });

    it('should only see assigned clients', () => {
      cy.visit('/clients');
      // Verify that only clients assigned to this agent are visible
      cy.get('[data-testid="clients-table"] tbody tr').each(($row) => {
        cy.wrap($row).should('contain', 'agent@amba.com');
      });
    });
  });

  describe('Unauthorized Access', () => {
    it('should redirect to login for unauthenticated users', () => {
      cy.visit('/clients');
      cy.url().should('include', '/auth');
    });

    it('should show access denied for insufficient permissions', () => {
      // Login as limited user
      cy.get('[data-testid="email-input"]').type('viewer@amba.com');
      cy.get('[data-testid="password-input"]').type('viewer123');
      cy.get('[data-testid="login-button"]').click();

      // Try to access restricted route
      cy.visit('/clients/create');
      cy.contains('Access Denied').should('be.visible');
      cy.contains('You need clients:create permission').should('be.visible');
    });
  });

  describe('Permission Tooltips', () => {
    beforeEach(() => {
      // Login as agent with limited permissions
      cy.get('[data-testid="email-input"]').type('agent@amba.com');
      cy.get('[data-testid="password-input"]').type('agent123');
      cy.get('[data-testid="login-button"]').click();
    });

    it('should show tooltips on disabled buttons', () => {
      cy.visit('/clients');
      
      // Find a disabled delete button and hover
      cy.get('[data-testid="delete-client-button"][disabled]').first().trigger('mouseover');
      cy.contains('Requires clients:delete permission').should('be.visible');
    });
  });

  describe('Branch-based Access Control', () => {
    beforeEach(() => {
      // Login as branch-specific user
      cy.get('[data-testid="email-input"]').type('branch-agent@amba.com');
      cy.get('[data-testid="password-input"]').type('branch123');
      cy.get('[data-testid="login-button"]').click();
    });

    it('should only show records from same branch', () => {
      cy.visit('/clients');
      
      // Verify all visible clients belong to the same branch
      cy.get('[data-testid="clients-table"] tbody tr').each(($row) => {
        cy.wrap($row).find('[data-testid="client-branch"]').should('contain', 'Branch A');
      });
    });

    it('should not allow editing records from different branches', () => {
      // This would require test data setup with cross-branch records
      cy.visit('/clients/different-branch-client-id');
      cy.contains('Access Denied').should('be.visible');
    });
  });
});
