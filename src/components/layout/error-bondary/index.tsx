import React, { ReactNode, useState, useEffect } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode; // Children components
  fallback?: ReactNode; // Optional fallback UI
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback,
}) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      setError(event.error || new Error('An unknown error occurred.'));
      setErrorInfo(
        `Error: ${event.error?.message || 'An unknown error occurred.'}`
      );
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setHasError(true);
      setError(
        event.reason || new Error('An unhandled promise rejection occurred.')
      );
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

  if (hasError) {
    return (
      fallback || (
        <div>
          <h1>Something went wrong.</h1>
          <p>{error?.message}</p>
          <pre>{errorInfo}</pre>
        </div>
      )
    );
  }

  return <>{children}</>;
};

export default ErrorBoundary;
