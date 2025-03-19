import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode; // Children components
  fallback?: ReactNode; // Optional fallback UI
}

interface ErrorBoundaryState {
  hasError: boolean; // Whether an error has occurred
  error?: Error; // The error object
  errorInfo?: ErrorInfo; // Additional error information
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  // Update state to display fallback UI
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  // Log the error
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    // Display fallback UI if an error occurred
    if (hasError) {
      return (
        fallback || (
          <div>
            <h1>Something went wrong.</h1>
            <p>{error?.message}</p>
            <pre>{errorInfo?.componentStack}</pre>
          </div>
        )
      );
    }

    // Render children if no error
    return children;
  }
}

export default ErrorBoundary;
