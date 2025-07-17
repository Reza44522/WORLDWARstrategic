import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { Shield, Users, MessageCircle, Settings, TrendingUp, AlertTriangle, Crown, LogOut, Map, Database, Send, HelpCircle, Gift, Swords, Antenna as Maintenance, Clock, Calendar, Save } from 'lucide-react';
import UserManagement from './UserManagement';
import ChatMonitoring from './ChatMonitoring';
import GameSettings from './GameSettings';
import Statistics from './Statistics';
import AdminMap from './AdminMap';
import AdminMessaging from './AdminMessaging';
import SupportTickets from './SupportTickets';
import ItemGifting from './ItemGifting';
import BattleSimulator from '../Game/BattleSimulator';

const AdminDashboard: React.FC = () => {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState('overview');

  // System settings management
  const [systemSettings, setSystemSettings] = useState(() => {
    const saved = localStorage.getItem('systemSettings');
    return saved ? JSON.parse(saved) : {
      isMaintenanceMode: false,
      isSeasonCountdownActive: false,
      seasonStartDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      maintenanceMessage: 'سایت در حال به‌روزرسانی است. لطفاً بعداً تلاش کنید'
    };
  });

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const toggleMaintenanceMode = () => {
    const newSettings = {
      ...systemSettings,
      isMaintenanceMode: !systemSettings.isMaintenanceMode
    };
    setSystemSettings(newSettings);
    localStorage.setItem('systemSettings', JSON.stringify(newSettings));
  };

  const toggleSeasonCountdown = () => {
    const newSettings = {
      ...systemSettings,
      isSeasonCountdownActive: !systemSettings.isSeasonCountdownActive
    };
    setSystemSettings(newSettings);
    localStorage.setItem('systemSettings', JSON.stringify(newSettings));
  };

  const updateSeasonStartDate = (date: string) => {
    const newSettings = {
      ...systemSettings,
      seasonStartDate: new Date(date)
    };
    setSystemSettings(newSettings);
    localStorage.setItem('systemSettings', JSON.stringify(newSettings));
  };

  const updateMaintenanceMessage = (message: string) => {
    const newSettings = {
      ...systemSettings,
      maintenanceMessage: message
    };
    setSystemSettings(newSettings);
    localStorage.setItem('systemSettings', JSON.stringify(newSettings));
  };

  const menuItems = [
    { id: 'overview', label: 'نمای کلی', icon: TrendingUp },
    { id: 'system', label: 'کنترل سیستم', icon: Settings },
    { id: 'map', label: 'نقشه مدیریت', icon: Map },
    { id: 'users', label: 'مدیریت کاربران', icon: Users },
    { id: 'gifting', label: 'اهدای آیتم ها', icon: Gift },
    { id: 'messaging', label: 'پیام‌رسانی', icon: Send },
    { id: 'chat', label: 'نظارت بر چت', icon: MessageCircle },
    { id: 'tickets', label: 'تیکت های پشتیبانی', icon: HelpCircle },
    { id: 'battle', label: 'شبیه‌ساز نبرد', icon: Swords },
    { id: 'settings', label: 'تنظیمات بازی', icon: Settings },
    { id: 'stats', label: 'آمار و گزارشات', icon: Database }
  ];

  const renderSystemControl = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2" dir="rtl">کنترل سیستم</h2>
        <p className="text-gray-300" dir="rtl">مدیریت دسترسی و تایمرهای سایت</p>
      </div>

      {/* Maintenance Mode Control */}
      <div className="bg-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2" dir="rtl">
          <Maintenance className="w-6 h-6" />
          <span>حالت نگهداری سایت</span>
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between" dir="rtl">
            <span className="text-white font-medium">وضعیت حالت نگهداری:</span>
            <button
              onClick={toggleMaintenanceMode}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                systemSettings.isMaintenanceMode
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {systemSettings.isMaintenanceMode ? 'فعال - غیرفعال کن' : 'غیرفعال - فعال کن'}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
              پیام نگهداری:
            </label>
            <textarea
              value={systemSettings.maintenanceMessage}
              onChange={(e) => updateMaintenanceMessage(e.target.value)}
              rows={3}
              className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white resize-none"
              dir="rtl"
            />
          </div>

          {systemSettings.isMaintenanceMode && (
            <div className="bg-orange-600/20 border border-orange-500 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2" dir="rtl">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <span className="text-orange-400 font-bold">حالت نگهداری فعال است</span>
              </div>
              <p className="text-orange-300 text-sm" dir="rtl">
                کاربران عادی نمی‌توانند وارد سایت شوند. فقط ادمین‌ها دسترسی دارند.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Season Countdown Control */}
      <div className="bg-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2" dir="rtl">
          <Clock className="w-6 h-6" />
          <span>تایمر سیزن جدید</span>
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between" dir="rtl">
            <span className="text-white font-medium">وضعیت تایمر:</span>
            <button
              onClick={toggleSeasonCountdown}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                systemSettings.isSeasonCountdownActive
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {systemSettings.isSeasonCountdownActive ? 'فعال - غیرفعال کن' : 'غیرفعال - فعال کن'}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
              تاریخ شروع سیزن:
            </label>
            <input
              type="datetime-local"
              value={new Date(systemSettings.seasonStartDate).toISOString().slice(0, 16)}
              onChange={(e) => updateSeasonStartDate(e.target.value)}
              className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>

          {systemSettings.isSeasonCountdownActive && (
            <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2" dir="rtl">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-bold">تایمر سیزن فعال است</span>
              </div>
              <p className="text-blue-300 text-sm" dir="rtl">
                کاربران عادی تا پایان تایمر نمی‌توانند وارد سایت شوند.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4" dir="rtl">وضعیت فعلی سیستم</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${
            systemSettings.isMaintenanceMode ? 'bg-orange-600/20' : 'bg-green-600/20'
          }`}>
            <div className="flex items-center space-x-2 mb-2" dir="rtl">
              <Maintenance className="w-5 h-5" />
              <span className="font-bold">حالت نگهداری</span>
            </div>
            <div className={`text-lg font-bold ${
              systemSettings.isMaintenanceMode ? 'text-orange-400' : 'text-green-400'
            }`}>
              {systemSettings.isMaintenanceMode ? 'فعال' : 'غیرفعال'}
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            systemSettings.isSeasonCountdownActive ? 'bg-blue-600/20' : 'bg-gray-600/20'
          }`}>
            <div className="flex items-center space-x-2 mb-2" dir="rtl">
              <Clock className="w-5 h-5" />
              <span className="font-bold">تایمر سیزن</span>
            </div>
            <div className={`text-lg font-bold ${
              systemSettings.isSeasonCountdownActive ? 'text-blue-400' : 'text-gray-400'
            }`}>
              {systemSettings.isSeasonCountdownActive ? 'فعال' : 'غیرفعال'}
            </div>
          </div>
        </div>

        {(systemSettings.isMaintenanceMode || systemSettings.isSeasonCountdownActive) && (
          <div className="mt-4 bg-yellow-600/20 border border-yellow-500 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2" dir="rtl">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-bold">توجه</span>
            </div>
            <p className="text-yellow-300 text-sm" dir="rtl">
              در حال حاضر کاربران عادی نمی‌توانند به سایت دسترسی داشته باشند.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Statistics />;
      case 'system':
        return renderSystemControl();
      case 'map':
        return <AdminMap />;
      case 'users':
        return <UserManagement />;
      case 'gifting':
        return <ItemGifting />;
      case 'messaging':
        return <AdminMessaging />;
      case 'chat':
        return <ChatMonitoring />;
      case 'tickets':
        return <SupportTickets />;
      case 'battle':
        return <BattleSimulator />;
      case 'settings':
        return <GameSettings />;
      case 'stats':
        return <Statistics />;
      default:
        return <Statistics />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4" dir="rtl">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-red-500" />
                <h1 className="text-2xl font-bold text-white">پنل مدیریت World War</h1>
              </div>
              <div className="flex items-center space-x-2 bg-red-600/20 px-3 py-1 rounded-lg">
                <Crown className="w-5 h-5 text-yellow-500" />
                <span className="text-white font-medium">
                  {state.currentUser?.role === 'admin' ? 'مدیر اصلی' : 'معاون مدیر'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* System Status Indicators */}
              {systemSettings.isMaintenanceMode && (
                <div className="flex items-center space-x-2 bg-orange-600/20 px-3 py-1 rounded-lg">
                  <Maintenance className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 text-sm font-medium">نگهداری فعال</span>
                </div>
              )}
              
              {systemSettings.isSeasonCountdownActive && (
                <div className="flex items-center space-x-2 bg-blue-600/20 px-3 py-1 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">تایمر فعال</span>
                </div>
              )}

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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-right ${
                        activeTab === item.id
                          ? 'bg-red-600 text-white'
                          : 'text-gray-300 hover:bg-white/10'
                      }`}
                      dir="rtl"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-600">
                <h3 className="text-sm font-bold text-gray-300 mb-3" dir="rtl">آمار سریع</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400" dir="rtl">
                    <span>بازیکنان فعال:</span>
                    <span className="text-white font-bold">{state.users.length}</span>
                  </div>
                  <div className="flex justify-between text-gray-400" dir="rtl">
                    <span>کشورهای اشغالی:</span>
                    <span className="text-white font-bold">
                      {state.countries.filter(c => c.isOccupied).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400" dir="rtl">
                    <span>پیام‌های چت:</span>
                    <span className="text-white font-bold">{state.chatMessages.length}</span>
                  </div>
                  <div className="flex justify-between text-gray-400" dir="rtl">
                    <span>تیکت های باز:</span>
                    <span className="text-white font-bold">
                      {state.supportTickets.filter(t => t.status === 'open').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400" dir="rtl">
                    <span>رویدادهای فعال:</span>
                    <span className="text-white font-bold">
                      {state.gameEvents.filter(e => e.isActive && new Date(e.expiresAt) > new Date()).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400" dir="rtl">
                    <span>اتحادها:</span>
                    <span className="text-white font-bold">{state.alliances.length}</span>
                  </div>
                  <div className="flex justify-between text-gray-400" dir="rtl">
                    <span>حالت نگهداری:</span>
                    <span className={`font-bold ${systemSettings.isMaintenanceMode ? 'text-orange-400' : 'text-green-400'}`}>
                      {systemSettings.isMaintenanceMode ? 'فعال' : 'غیرفعال'}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400" dir="rtl">
                    <span>تایمر سیزن:</span>
                    <span className={`font-bold ${systemSettings.isSeasonCountdownActive ? 'text-blue-400' : 'text-gray-400'}`}>
                      {systemSettings.isSeasonCountdownActive ? 'فعال' : 'غیرفعال'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;