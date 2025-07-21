import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorProps {
  message: string;
  variant?: 'error' | 'warning' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const Error: React.FC<ErrorProps> = ({
  message,
  variant = 'error',
  dismissible = false,
  onDismiss,
  className = '',
}) => {
  const variantClasses = {
    error: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  const iconClasses = {
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };

  return (
    <div className={`p-3 border rounded-md ${variantClasses[variant]} ${className}`}>
      <div className="flex items-start">
        <AlertCircle className={`h-5 w-5 mt-0.5 mr-2 flex-shrink-0 ${iconClasses[variant]}`} />
        <div className="flex-1">
          <p className="text-sm">{message}</p>
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Error; 