import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Intentionally lightweight: log only in dev to avoid noise in prod.
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="p-4 text-sm text-red-700 bg-red-50 rounded-md">
          Ocorreu um erro inesperado. Tente recarregar a página.
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

