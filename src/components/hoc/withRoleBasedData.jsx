
import React from 'react';
import { usePermissions } from '@/contexts/PermissionsContext';

const withRoleBasedData = (WrappedComponent, entityType) => {
  return function RoleBasedDataComponent(props) {
    const { getFilteredData, isAgent, isSuperAdmin } = usePermissions();

    // Override data props with filtered data for agents
    const enhancedProps = {
      ...props,
      // Add role information
      isAgent: isAgent(),
      isSuperAdmin: isSuperAdmin(),
      // Filter data if provided
      ...(props.data && { data: getFilteredData(props.data, entityType) }),
    };

    return <WrappedComponent {...enhancedProps} />;
  };
};

export default withRoleBasedData;
