import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#1f2937',
          color: 'white',
          fontFamily: 'Vazirmatn, sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ef4444' }}>
            خطا در بارگذاری برنامه
          </h1>
          <p style={{ marginBottom: '2rem', color: '#d1d5db' }}>
            متأسفانه مشکلی در بارگذاری برنامه رخ داده است.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            تلاش مجدد
          </button>
          <details style={{ marginTop: '2rem', maxWidth: '600px' }}>
            <summary style={{ cursor: 'pointer', color: '#9ca3af' }}>
              جزئیات خطا (برای توسعه‌دهندگان)
            </summary>
            <pre style={{ 
              backgroundColor: '#374151', 
              padding: '1rem', 
              borderRadius: '4px', 
              marginTop: '1rem',
              fontSize: '0.875rem',
              overflow: 'auto',
              textAlign: 'left'
            }}>
              {this.state.error?.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Check if DOM is ready
function initializeApp() {
  try {
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    // Check for required browser features
    if (!window.localStorage) {
      throw new Error('LocalStorage is not supported');
    }

    if (!window.fetch) {
      throw new Error('Fetch API is not supported');
    }

    const root = createRoot(rootElement);
    
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
  } catch (error) {
    console.error('Failed to initialize app:', error);
    
    // Fallback error display
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #1f2937;
          color: white;
          font-family: Vazirmatn, sans-serif;
          padding: 20px;
          text-align: center;
        ">
          <h1 style="font-size: 2rem; margin-bottom: 1rem; color: #ef4444;">
            خطا در بارگذاری برنامه
          </h1>
          <p style="margin-bottom: 2rem; color: #d1d5db;">
            مرورگر شما ممکن است از این برنامه پشتیبانی نکند.
          </p>
          <p style="margin-bottom: 2rem; color: #9ca3af; font-size: 0.875rem;">
            لطفاً از آخرین نسخه Chrome، Firefox یا Safari استفاده کنید.
          </p>
          <button
            onclick="window.location.reload()"
            style="
              background-color: #3b82f6;
              color: white;
              padding: 12px 24px;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-size: 1rem;
            "
          >
            تلاش مجدد
          </button>
        </div>
      `;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}