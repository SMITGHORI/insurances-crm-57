
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AccessDeniedProps {
  /** Custom message to display */
  message?: string;
  /** Show return home button */
  showHomeButton?: boolean;
  /** Custom action to perform on home click */
  onHomeClick?: () => void;
}

/**
 * AccessDenied component for unauthorized access scenarios
 * Used as default fallback for Protected components and routes
 */
export const AccessDenied: React.FC<AccessDeniedProps> = ({
  message = "You don't have permission to access this resource.",
  showHomeButton = true,
  onHomeClick
}) => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[50vh] p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">{message}</p>
          {showHomeButton && (
            <Button onClick={handleHomeClick} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDenied;
