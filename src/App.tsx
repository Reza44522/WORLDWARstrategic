import React, { useState, Suspense, lazy } from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import { AudioProvider } from './contexts/AudioContext';
import AudioPlayer from './components/Common/AudioPlayer';
import WarAlertDisplay from './components/Common/WarAlertDisplay';

// Lazy load components to improve initial load time
const Login = lazy(() => import('./components/Auth/Login'));
const Register = lazy(() => import('./components/Auth/Register'));
const GameDashboard = lazy(() => import('./components/Game/GameDashboard'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-amber-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
      <p className="text-white text-lg" dir="rtl">در حال بارگذاری...</p>
    </div>
  </div>
);

// Error fallback component
const ErrorFallback = ({ error, resetError }) => (
  <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-amber-900 flex items-center justify-center p-4">
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
      <div className="text-red-600 text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4" dir="rtl">خطا در برنامه</h1>
      <p className="text-gray-600 mb-6" dir="rtl">
        متأسفانه مشکلی رخ داده است. لطفاً صفحه را بازخوانی کنید.
      </p>
      <div className="space-y-3">
        <button
          onClick={resetError}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          تلاش مجدد
        </button>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          بازخوانی صفحه
        </button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-gray-500 text-sm">جزئیات خطا</summary>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
            {error?.toString()}
          </pre>
        </details>
      )}
    </div>
  </div>
);

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error} 
          resetError={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const { state } = useGame();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (!state.isAuthenticated) {
    return (
      <>
        <Suspense fallback={<LoadingSpinner />}>
          {authMode === 'login' ? (
            <Login onSwitchToRegister={() => setAuthMode('register')} />
          ) : (
            <Register onSwitchToLogin={() => setAuthMode('login')} />
          )}
        </Suspense>
        
        {/* Audio Player for Login/Register */}
        <div className="fixed bottom-4 right-4 z-40">
          <AudioPlayer showFullControls={false} />
        </div>
        
        {/* War Alerts */}
        <WarAlertDisplay />
      </>
    );
  }

  if (state.currentUser?.role === 'admin' || state.currentUser?.role === 'assistant') {
    return (
      <>
        <Suspense fallback={<LoadingSpinner />}>
          <AdminDashboard />
        </Suspense>
        
        {/* Audio Player for Admin */}
        <div className="fixed bottom-4 right-4 z-40">
          <AudioPlayer />
        </div>
        
        {/* War Alerts */}
        <WarAlertDisplay />
      </>
    );
  }

  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <GameDashboard />
      </Suspense>
      
      {/* Audio Player for Game */}
      <div className="fixed bottom-4 right-4 z-40">
        <AudioPlayer />
      </div>
      
      {/* War Alerts */}
      <WarAlertDisplay />
    </>
  );
};

function App() {
  return (
    <AppErrorBoundary>
      <GameProvider>
        <AudioProvider>
          <AppContent />
        </AudioProvider>
      </GameProvider>
    </AppErrorBoundary>
  );
}

export default App;