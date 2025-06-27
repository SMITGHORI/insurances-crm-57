
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProtectedFieldProps {
  /** The module to check permission for */
  module: string;
  /** The action to check permission for (typically 'edit') */
  action: string;
  /** The field content to render */
  children: React.ReactNode;
  /** Whether to show the lock icon for read-only fields */
  showLockIcon?: boolean;
  /** Custom className for the wrapper */
  className?: string;
  /** Whether this field is sensitive (requires special permission) */
  sensitive?: boolean;
}

/**
 * ProtectedField component for form field-level access control
 * Makes fields read-only based on user permissions
 */
export const ProtectedField: React.FC<ProtectedFieldProps> = ({
  module,
  action,
  children,
  showLockIcon = true,
  className,
  sensitive = false
}) => {
  const { hasPermission } = usePermissions();
  
  // Check if user has permission to edit this field
  const canEdit = hasPermission(module, action);
  
  // For sensitive fields, require special permission
  const sensitivePermission = sensitive ? hasPermission(module, 'edit_sensitive') : true;
  
  const isReadOnly = !canEdit || !sensitivePermission;

  // If field is editable, render as-is
  if (!isReadOnly) {
    return <>{children}</>;
  }

  // Clone children and add read-only properties
  const readOnlyChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // Add read-only properties to form inputs
      return React.cloneElement(child as React.ReactElement<any>, {
        readOnly: true,
        disabled: true,
        className: cn(
          child.props.className,
          'bg-gray-50 cursor-not-allowed opacity-75'
        )
      });
    }
    return child;
  });

  return (
    <div className={cn('relative', className)}>
      {readOnlyChildren}
      {showLockIcon && (
        <Lock className="absolute top-2 right-2 h-4 w-4 text-gray-400" />
      )}
    </div>
  );
};

export default ProtectedField;
