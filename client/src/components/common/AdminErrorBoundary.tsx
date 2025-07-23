import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface AdminErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface AdminErrorBoundaryProps {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

class AdminErrorBoundary extends Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AdminErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Admin Error Boundary caught an error:', error, errorInfo);
    }
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-center max-w-md p-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Admin Panel Error
            </h3>
            
            <p className="text-sm text-gray-600 mb-6">
              Something went wrong in the admin panel. This section couldn't load properly.
            </p>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="mb-6 p-3 bg-gray-100 rounded-md text-left">
                <p className="text-xs font-mono text-gray-700 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/admin'}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Home className="h-4 w-4 mr-2" />
                Admin Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdminErrorBoundary;