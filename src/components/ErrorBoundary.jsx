import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("💥 Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel" style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          margin: '2rem auto', 
          maxWidth: '500px',
          color: '#fca5a5' 
        }}>
          <AlertTriangle size={48} style={{ marginBottom: '1rem', opacity: 0.8 }} />
          <h2>Something went wrong</h2>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button 
            className="btn" 
            style={{ marginTop: '1.5rem' }}
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
