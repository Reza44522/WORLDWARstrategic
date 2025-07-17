import React from 'react';
import { useAudio } from '../../contexts/AudioContext';
import { AlertTriangle, X } from 'lucide-react';

const WarAlertDisplay: React.FC = () => {
  const { state, dispatch } = useAudio();

  if (!state.alertSettings.showVisualAlert || state.warAlerts.length === 0) {
    return null;
  }

  const dismissAlert = (alertId: string) => {
    dispatch({ type: 'REMOVE_WAR_ALERT', payload: { alertId } });
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {state.warAlerts.map((alert) => (
        <div
          key={alert.id}
          className="bg-red-600 text-white p-4 rounded-lg shadow-lg max-w-sm animate-pulse border-2 border-red-400"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2" dir="rtl">
              <AlertTriangle className="w-6 h-6 text-yellow-300 animate-bounce" />
              <div>
                <div className="font-bold text-lg">🚨 هشدار حمله!</div>
                <div className="text-sm">
                  {alert.attackerCountry} به {alert.defenderCountry} حمله کرد!
                </div>
                <div className="text-xs opacity-75 mt-1">
                  {new Date(alert.timestamp).toLocaleTimeString('fa-IR')}
                </div>
              </div>
            </div>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="text-white hover:text-gray-200 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WarAlertDisplay;