import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import WorldMap from './WorldMap';
import Chat from './Chat';
import ResourcePanel from './ResourcePanel';
import PlayersList from './PlayersList';
import CountryManagement from './CountryManagement';
import MarketPrices from './MarketPrices';
import NewsSection from './NewsSection';
import BattleSimulator from './BattleSimulator';
import { LogOut, Crown, Users, MessageCircle, Coins, Settings, Clock, TrendingUp, Newspaper, Bell, X, Swords } from 'lucide-react';

const GameDashboard: React.FC = () => {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<'map' | 'country' | 'chat' | 'news' | 'battle'>('map');
  const [timeLeft, setTimeLeft] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const currentUserCountry = state.currentUser?.country 
    ? state.countries.find(c => c.id === state.currentUser.country)
    : null;

  // Calculate time left in season
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const seasonStart = new Date(state.gameSettings.seasonStartDate);
      const seasonEnd = new Date(seasonStart.getTime() + state.gameSettings.seasonDuration * 24 * 60 * 60 * 1000);
      const timeDiff = seasonEnd.getTime() - now.getTime();

      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${days}روز ${hours}ساعت ${minutes}دقیقه`);
      } else {
        setTimeLeft('فصل پایان یافته');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [state.gameSettings.seasonStartDate, state.gameSettings.seasonDuration]);

  // Handle notifications
  useEffect(() => {
    const userNotifications = state.notifications.filter(n => 
      n.userId === state.currentUser?.id && !n.isRead
    );
    setNotifications(userNotifications);

    // Auto-hide notifications after 10 seconds
    userNotifications.forEach(notification => {
      setTimeout(() => {
        dispatch({ type: 'MARK_NOTIFICATION_READ', payload: { notificationId: notification.id } });
      }, 10000);
    });
  }, [state.notifications, state.currentUser?.id, dispatch]);

  const dismissNotification = (notificationId: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: { notificationId } });
  };

  // Get active events
  const activeEvents = state.gameEvents.filter(event => 
    event.isActive && new Date(event.expiresAt) > new Date()
  );

  // Handle tab change and mark chat messages as read
  const handleTabChange = (tab: typeof activeTab) => {
    if (tab === 'chat') {
      dispatch({ type: 'MARK_MESSAGES_READ', payload: { type: 'all' } });
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Active Events Banner */}
      {activeEvents.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-2 px-4 text-center">
          <div className="flex items-center justify-center space-x-2" dir="rtl">
            <MessageCircle className="w-4 h-4" />
            <span className="font-bold">رویداد فعال:</span>
            <span>{activeEvents[0].title} - {activeEvents[0].message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4" dir="rtl">
              <div className="flex items-center space-x-2">
                <Crown className="w-8 h-8 text-yellow-500" />
                <h1 className="text-2xl font-bold text-white">World War</h1>
              </div>
              {currentUserCountry && (
                <div className="flex items-center space-x-2 bg-green-600/20 px-3 py-1 rounded-lg">
                  <span className="text-2xl">{currentUserCountry.flag}</span>
                  <span className="text-white font-medium">{currentUserCountry.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Season Timer */}
              <div className="flex items-center space-x-2 bg-blue-600/20 px-3 py-1 rounded-lg">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm font-medium">{timeLeft}</span>
              </div>

              <div className="flex items-center space-x-2 text-white">
                <Coins className="w-5 h-5 text-yellow-500" />
                <span className="font-bold">{state.currentUser?.money?.toLocaleString()} WD</span>
              </div>
              
              <div className="flex items-center space-x-2 text-white">
                <Users className="w-5 h-5 text-blue-500" />
                <span>{state.users.length}/{state.gameSettings.maxPlayers}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>خروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Market Prices */}
            <MarketPrices />

            {/* Tab Navigation */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleTabChange('map')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'map'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <Crown className="w-5 h-5" />
                  <span>نقشه جهانی</span>
                </button>
                <button
                  onClick={() => handleTabChange('country')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'country'
                      ? 'bg-green-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>مدیریت کشور</span>
                </button>
                <button
                  onClick={() => handleTabChange('chat')}
                  className={`relative flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'chat'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>چت بازی</span>
                  {state.unreadChatCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {state.unreadChatCount > 9 ? '9+' : state.unreadChatCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleTabChange('news')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'news'
                      ? 'bg-orange-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <Newspaper className="w-5 h-5" />
                  <span>اخبار</span>
                </button>
                <button
                  onClick={() => handleTabChange('battle')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'battle'
                      ? 'bg-red-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <Swords className="w-5 h-5" />
                  <span>شبیه‌ساز نبرد</span>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              {activeTab === 'map' && (
                <>
                  <h2 className="text-2xl font-bold text-white mb-4 text-center" dir="rtl">
                    نقشه جهانی - انتخاب کشور
                  </h2>
                  <WorldMap />
                </>
              )}
              
              {activeTab === 'country' && <CountryManagement />}
              
              {activeTab === 'chat' && (
                <>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2" dir="rtl">
                    <MessageCircle className="w-6 h-6" />
                    <span>چت بازی</span>
                  </h2>
                  <Chat />
                </>
              )}

              {activeTab === 'news' && <NewsSection />}

              {activeTab === 'battle' && <BattleSimulator />}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resources */}
            <ResourcePanel />
            
            {/* Players List */}
            <PlayersList />
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm animate-fadeIn"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-sm mb-1" dir="rtl">{notification.title}</div>
                  <div className="text-sm" dir="rtl">{notification.message}</div>
                </div>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="text-white hover:text-gray-200 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameDashboard;