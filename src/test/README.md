# RBAC Testing Documentation

## Overview

This directory contains comprehensive tests for the Role-Based Access Control (RBAC) system in our Insurance CRM. The testing strategy covers unit tests, integration tests, and end-to-end tests.

## Test Structure

### Unit Tests

#### `usePermissions.test.tsx`
Tests the core permission checking logic:
- Super admin permissions (all access)
- Role-based permission filtering
- Branch-based access control
- Null user handling

#### `Protected.test.tsx`
Tests the Protected component wrapper:
- Renders children when permission granted
- Shows AccessDenied when permission denied
- Handles custom fallback components
- Branch checking integration

#### `AccessDenied.test.tsx`
Tests the access denied UI component:
- Default message and navigation
- Custom messages
- Home button visibility
- Custom click handlers

#### `ProtectedField.test.tsx`
Tests field-level access control:
- Editable vs read-only states
- Sensitive field handling
- Lock icon display
- Child component cloning

#### `permission-tooltip.test.tsx`
Tests permission tooltips:
- Shows tooltip when disabled
- Hides tooltip when enabled
- Custom message support
- Lock icon display

### Integration Tests

#### `RBAC.integration.test.tsx`
Tests component interactions:
- Multiple Protected components
- Branch-based row filtering
- Field and component protection combination

### E2E Tests (Cypress)

#### `rbac.cy.js`
End-to-end user journey tests:
- Role-based navigation access
- Route protection and redirection
- Action button availability
- Permission tooltips
- Branch-based data filtering

## Running Tests

### Unit and Integration Tests
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch

# Run specific test file
npm run test -- usePermissions.test.tsx
```

### E2E Tests
```bash
# Open Cypress GUI
npm run cypress:open

# Run headless
npm run cypress:run

# Run specific test
npm run cypress:run -- --spec "cypress/e2e/rbac.cy.js"
```

### Storybook (Visual Testing)
```bash
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

## Test Coverage Goals

- **Unit Tests**: ≥90% coverage on RBAC components and hooks
- **Integration Tests**: Cover all component interaction scenarios
- **E2E Tests**: Cover all user roles and permission combinations

## Test Data Setup

### Mock Users
```javascript
const mockUsers = {
  superAdmin: {
    role: 'super_admin',
    permissions: [], // Has all permissions
    branch: 'all'
  },
  admin: {
    role: 'admin', 
    permissions: [
      { module: 'clients', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'policies', actions: ['view', 'create', 'edit'] },
      // ... other permissions
    ],
    branch: 'main'
  },
  agent: {
    role: 'agent',
    permissions: [
      { module: 'clients', actions: ['view', 'edit'] },
      { module: 'leads', actions: ['view', 'create', 'edit'] }
    ],
    branch: 'branch-a'
  }
};
```

## Writing New Tests

### Testing Components with RBAC

1. **Mock the usePermissions hook**:
```javascript
vi.mock('../../hooks/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: vi.fn().mockReturnValue(true),
    isSameBranch: vi.fn().mockReturnValue(true),
    // ... other methods
  })
}));
```

2. **Test both allowed and denied states**:
```javascript
it('renders component when permission granted', () => {
  // Mock hasPermission to return true
  render(<YourProtectedComponent />);
  expect(screen.getByTestId('protected-content')).toBeInTheDocument();
});

it('shows access denied when permission denied', () => {
  // Mock hasPermission to return false  
  render(<YourProtectedComponent />);
  expect(screen.getByText('Access Denied')).toBeInTheDocument();
});
```

3. **Test branch-based access**:
```javascript
it('respects branch restrictions', () => {
  // Mock isSameBranch appropriately
  // Test component behavior
});
```

## Best Practices

1. **Always test both positive and negative cases**
2. **Mock external dependencies consistently**
3. **Use descriptive test names**
4. **Test user interactions, not implementation details**
5. **Keep tests focused and atomic**
6. **Use test data that reflects real scenarios**

## Debugging Tests

### Common Issues

1. **Missing mocks**: Ensure all external dependencies are mocked
2. **Async operations**: Use appropriate async testing utilities
3. **Component cleanup**: Tests should clean up after themselves
4. **Context providers**: Wrap components with necessary providers

### Debugging Commands
```bash
# Run tests with debug output
npm run test -- --reporter=verbose

# Run single test with debugging
npm run test -- --no-coverage YourTest.test.tsx
```
