import React, { ReactNode, useEffect } from 'react';
import { toast } from 'react-toastify';

interface ErrorBoundaryProps {
  children: ReactNode;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  useEffect(() => {
    const handleError = (errorEvent: ErrorEvent) => {
      errorEvent.stopPropagation();
      toast.error('An unknown error occurred.');
    };

    const handleUnhandledRejection = (
      promiseRejectionEvent: PromiseRejectionEvent
    ) => {
      promiseRejectionEvent.stopPropagation();
      toast.error('An unhandled promise rejection occurred.');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection
      );
    };
  }, []);

  return <>{children}</>;
};

export default ErrorBoundary;
