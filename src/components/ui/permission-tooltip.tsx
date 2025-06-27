
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';

interface PermissionTooltipProps {
  children: React.ReactNode;
  module: string;
  action: string;
  disabled?: boolean;
  message?: string;
}

/**
 * Tooltip wrapper for permission-restricted elements
 * Shows permission requirements when action is disabled
 */
export const PermissionTooltip: React.FC<PermissionTooltipProps> = ({
  children,
  module,
  action,
  disabled = false,
  message
}) => {
  if (!disabled) {
    return <>{children}</>;
  }

  const defaultMessage = message || `Requires ${module}:${action} permission`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            {children}
            <Lock className="absolute -top-1 -right-1 h-3 w-3 text-gray-400" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{defaultMessage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
