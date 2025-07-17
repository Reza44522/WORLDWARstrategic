import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { 
  Users, 
  MessageCircle, 
  Shield, 
  TrendingUp, 
  Crown, 
  Swords,
  Download,
  Calendar
} from 'lucide-react';

const Statistics: React.FC = () => {
  const { state } = useGame();

  const totalPlayers = state.users.length;
  const activePlayers = state.users.filter(u => !u.isSuspended).length;
  const suspendedPlayers = state.users.filter(u => u.isSuspended).length;
  const occupiedCountries = state.countries.filter(c => c.isOccupied).length;
  const totalMessages = state.chatMessages.length;
  const activeAlliances = state.alliances.length;
  const activeTrades = state.trades.filter(t => t.status === 'active').length;
  const activeWars = state.wars.filter(w => w.status === 'active').length;

  const recentMessages = state.chatMessages
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const topPlayers = state.users
    .filter(u => u.role === 'player')
    .sort((a, b) => {
      const aPower = (a.resources.soldiers + a.resources.weapons + a.money / 100);
      const bPower = (b.resources.soldiers + b.resources.weapons + b.money / 100);
      return bPower - aPower;
    })
    .slice(0, 5);

  const exportData = () => {
    const data = {
      statistics: {
        totalPlayers,
        activePlayers,
        suspendedPlayers,
        occupiedCountries,
        totalMessages,
        activeAlliances,
        activeTrades,
        activeWars
      },
      users: state.users,
      countries: state.countries,
      messages: state.chatMessages,
      alliances: state.alliances,
      trades: state.trades,
      wars: state.wars,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `world-war-data-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white" dir="rtl">آمار و گزارشات</h2>
        <button
          onClick={exportData}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>دانلود گزارش</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium" dir="rtl">کل بازیکنان</p>
              <p className="text-3xl font-bold text-white">{totalPlayers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-green-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium" dir="rtl">بازیکنان فعال</p>
              <p className="text-3xl font-bold text-white">{activePlayers}</p>
            </div>
            <Shield className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-yellow-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm font-medium" dir="rtl">کشورهای اشغالی</p>
              <p className="text-3xl font-bold text-white">{occupiedCountries}</p>
            </div>
            <Crown className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-purple-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium" dir="rtl">پیام‌های چت</p>
              <p className="text-3xl font-bold text-white">{totalMessages}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-400 text-sm font-medium" dir="rtl">جنگ‌های فعال</p>
              <p className="text-2xl font-bold text-white">{activeWars}</p>
            </div>
            <Swords className="w-6 h-6 text-red-400" />
          </div>
        </div>

        <div className="bg-indigo-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-400 text-sm font-medium" dir="rtl">اتحادهای فعال</p>
              <p className="text-2xl font-bold text-white">{activeAlliances}</p>
            </div>
            <Users className="w-6 h-6 text-indigo-400" />
          </div>
        </div>

        <div className="bg-orange-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-400 text-sm font-medium" dir="rtl">معاملات فعال</p>
              <p className="text-2xl font-bold text-white">{activeTrades}</p>
            </div>
            <TrendingUp className="w-6 h-6 text-orange-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Players */}
        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2" dir="rtl">
            <Crown className="w-6 h-6 text-yellow-500" />
            <span>برترین بازیکنان</span>
          </h3>
          
          <div className="space-y-3">
            {topPlayers.map((player, index) => {
              const playerCountry = player.country ? state.countries.find(c => c.id === player.country) : null;
              const totalPower = player.resources.soldiers + player.resources.weapons + Math.floor(player.money / 100);
              
              return (
                <div key={player.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                  <div className="flex items-center space-x-3" dir="rtl">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    {playerCountry && <span className="text-xl">{playerCountry.flag}</span>}
                    <div>
                      <div className="font-bold text-white">{player.username}</div>
                      {playerCountry && (
                        <div className="text-sm text-gray-400">{playerCountry.name}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{totalPower.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">قدرت کل</div>
                  </div>
                </div>
              );
            })}
            
            {topPlayers.length === 0 && (
              <div className="text-center text-gray-400 py-4" dir="rtl">
                هنوز بازیکنی وجود ندارد
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2" dir="rtl">
            <Calendar className="w-6 h-6 text-blue-500" />
            <span>فعالیت‌های اخیر</span>
          </h3>
          
          <div className="space-y-3">
            {recentMessages.map((message) => (
              <div key={message.id} className="bg-white/5 rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-white text-sm">{message.senderName}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(message.timestamp).toLocaleTimeString('fa-IR')}
                  </span>
                </div>
                <p className="text-gray-300 text-sm" dir="rtl">
                  {message.content.length > 50 
                    ? message.content.substring(0, 50) + '...' 
                    : message.content
                  }
                </p>
                <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                  message.type === 'public' 
                    ? 'bg-blue-600/20 text-blue-400'
                    : message.type === 'private'
                    ? 'bg-green-600/20 text-green-400'
                    : 'bg-purple-600/20 text-purple-400'
                }`}>
                  {message.type === 'public' ? 'عمومی' : 
                   message.type === 'private' ? 'خصوصی' : 'اتحاد'}
                </span>
              </div>
            ))}
            
            {recentMessages.length === 0 && (
              <div className="text-center text-gray-400 py-4" dir="rtl">
                فعالیت اخیری وجود ندارد
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white/10 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4" dir="rtl">اطلاعات سیستم</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-gray-400 mb-1">حداکثر بازیکنان:</div>
            <div className="text-white font-bold">{state.gameSettings.maxPlayers}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-gray-400 mb-1">مدت فصل:</div>
            <div className="text-white font-bold">{state.gameSettings.seasonDuration} روز</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-gray-400 mb-1">پول اولیه:</div>
            <div className="text-white font-bold">{state.gameSettings.initialMoney.toLocaleString()} WD</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;