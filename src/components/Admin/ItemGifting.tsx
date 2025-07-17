import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { Gift, User, DollarSign, Package, Fuel, Wheat, Wrench, Zap, Users, Send, Minus, Plus } from 'lucide-react';

const ItemGifting: React.FC = () => {
  const { state, dispatch } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [actionType, setActionType] = useState<'gift' | 'remove'>('gift');
  const [moneyAmount, setMoneyAmount] = useState(0);
  const [resources, setResources] = useState({
    oil: 0,
    food: 0,
    metals: 0,
    weapons: 0,
    soldiers: 0,
    goods: 0,
    aircraft: 0,
    tanks: 0,
    missiles: 0,
    submarines: 0,
    electricity: 0,
    ships: 0
  });

  const players = state.users.filter(u => u.role === 'player');

  const resourceIcons = {
    oil: Fuel,
    food: Wheat,
    metals: Wrench,
    weapons: Zap,
    soldiers: Users,
    goods: Package,
    aircraft: Package,
    tanks: Package,
    missiles: Package,
    submarines: Package,
    electricity: Package,
    ships: Package
  };

  const resourceNames = {
    oil: 'نفت',
    food: 'غذا',
    metals: 'فلزات',
    weapons: 'سلاح',
    soldiers: 'سرباز',
    goods: 'کالا',
    aircraft: 'هواپیما',
    tanks: 'تانک',
    missiles: 'موشک',
    submarines: 'زیردریایی',
    electricity: 'برق',
    ships: 'کشتی'
  };

  const handleAction = () => {
    if (!selectedPlayer) {
      alert('لطفاً بازیکن مورد نظر را انتخاب کنید');
      return;
    }

    const hasResources = Object.values(resources).some(amount => amount > 0);
    const hasMoney = moneyAmount > 0;

    if (!hasResources && !hasMoney) {
      alert('لطفاً حداقل یک منبع یا مقدار پول را وارد کنید');
      return;
    }

    const targetPlayer = players.find(p => p.id === selectedPlayer);
    if (!targetPlayer) {
      alert('بازیکن مورد نظر یافت نشد');
      return;
    }

    if (actionType === 'remove') {
      // Check if player has enough resources to remove
      for (const [resource, amount] of Object.entries(resources)) {
        if (amount > 0 && targetPlayer.resources[resource as keyof typeof targetPlayer.resources] < amount) {
          alert(`بازیکن ${resourceNames[resource as keyof typeof resourceNames]} کافی ندارد`);
          return;
        }
      }
      if (moneyAmount > 0 && targetPlayer.money < moneyAmount) {
        alert('بازیکن پول کافی ندارد');
        return;
      }
    }

    const actionData = {
      userId: selectedPlayer,
      resources,
      money: moneyAmount
    };

    if (actionType === 'gift') {
      dispatch({ type: 'GIFT_ITEMS', payload: actionData });
    } else {
      dispatch({ type: 'REMOVE_ITEMS', payload: actionData });
    }

    // Create notification message
    const actionMessage = actionType === 'gift' 
      ? `🎁 شما از مدیریت دریافت کردید:`
      : `⚠️ از منابع شما کسر شد:`;

    let itemsList = [];
    if (moneyAmount > 0) {
      itemsList.push(`${moneyAmount.toLocaleString()} دلار جنگ`);
    }
    
    Object.entries(resources)
      .filter(([_, amount]) => amount > 0)
      .forEach(([resource, amount]) => {
        itemsList.push(`${amount.toLocaleString()} ${resourceNames[resource as keyof typeof resourceNames]}`);
      });

    const notificationMessage = {
      id: Date.now().toString(),
      sender: state.currentUser!.id,
      senderName: actionType === 'gift' ? '🎁 هدیه مدیریت' : '⚠️ کسر مدیریت',
      content: `${actionMessage}\n${itemsList.join('\n')}`,
      timestamp: new Date(),
      type: 'admin_private' as const,
      recipient: selectedPlayer,
      isAdminMessage: true
    };

    dispatch({ type: 'SEND_MESSAGE', payload: notificationMessage });

    alert(`${actionType === 'gift' ? 'هدیه' : 'کسر منابع'} با موفقیت ${actionType === 'gift' ? 'به' : 'از'} ${targetPlayer.username} ${actionType === 'gift' ? 'ارسال' : 'انجام'} شد`);
    
    // Reset form
    setSelectedPlayer('');
    setMoneyAmount(0);
    setResources({
      oil: 0,
      food: 0,
      metals: 0,
      weapons: 0,
      soldiers: 0,
      goods: 0,
      aircraft: 0,
      tanks: 0,
      missiles: 0,
      submarines: 0,
      electricity: 0,
      ships: 0
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white" dir="rtl">مدیریت منابع بازیکنان</h2>
        <div className="text-sm text-gray-300" dir="rtl">
          اهدا یا کسر منابع و پول
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Action Form */}
        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2" dir="rtl">
            <Gift className="w-6 h-6" />
            <span>مدیریت منابع</span>
          </h3>

          <div className="space-y-4">
            {/* Player Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                انتخاب بازیکن:
              </label>
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              >
                <option value="">بازیکن مورد نظر را انتخاب کنید</option>
                {players.map(player => {
                  const playerCountry = player.country ? state.countries.find(c => c.id === player.country) : null;
                  return (
                    <option key={player.id} value={player.id}>
                      {player.username} {playerCountry ? `(${playerCountry.name})` : '(بدون کشور)'}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Action Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                نوع عملیات:
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActionType('gift')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    actionType === 'gift'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>اهدا</span>
                </button>
                <button
                  onClick={() => setActionType('remove')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    actionType === 'remove'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                  <span>کسر</span>
                </button>
              </div>
            </div>

            {/* Money */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                مقدار پول (WD):
              </label>
              <input
                type="number"
                value={moneyAmount}
                onChange={(e) => setMoneyAmount(parseInt(e.target.value) || 0)}
                min="0"
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500"
                placeholder="مقدار پول مورد نظر"
                dir="rtl"
              />
            </div>

            {/* Resources */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                منابع:
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(resourceNames).map(([key, name]) => {
                  const Icon = resourceIcons[key as keyof typeof resourceIcons];
                  
                  return (
                    <div key={key} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2" dir="rtl">
                        <Icon className="w-4 h-4 text-gray-400" />
                        <span className="text-white text-sm font-medium">{name}</span>
                      </div>
                      <input
                        type="number"
                        value={resources[key as keyof typeof resources]}
                        onChange={(e) => setResources(prev => ({
                          ...prev,
                          [key]: parseInt(e.target.value) || 0
                        }))}
                        min="0"
                        className="w-full bg-white/10 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        placeholder="0"
                        dir="rtl"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleAction}
              disabled={!selectedPlayer || (moneyAmount <= 0 && !Object.values(resources).some(amount => amount > 0))}
              className={`w-full font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                actionType === 'gift'
                  ? 'bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white'
                  : 'bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white'
              }`}
            >
              <Send className="w-5 h-5" />
              <span>
                {actionType === 'gift' ? 'اهدا منابع' : 'کسر منابع'}
              </span>
            </button>
          </div>
        </div>

        {/* Player Info */}
        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2" dir="rtl">
            <User className="w-6 h-6" />
            <span>اطلاعات بازیکن</span>
          </h3>

          {selectedPlayer ? (
            (() => {
              const player = players.find(p => p.id === selectedPlayer);
              const playerCountry = player?.country ? state.countries.find(c => c.id === player.country) : null;
              
              if (!player) return null;
              
              return (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-white">{player.username}</h4>
                    <p className="text-gray-400">{player.email}</p>
                  </div>

                  {playerCountry && (
                    <div className="bg-green-600/20 rounded-lg p-4 text-center">
                      <div className="text-3xl mb-2">{playerCountry.flag}</div>
                      <div className="font-bold text-white">{playerCountry.name}</div>
                      <div className="text-sm text-gray-300">قدرت: {playerCountry.power}</div>
                    </div>
                  )}

                  <div className="bg-yellow-600/20 rounded-lg p-4">
                    <h5 className="font-bold text-yellow-400 mb-2" dir="rtl">دارایی فعلی:</h5>
                    <div className="text-center mb-3">
                      <div className="text-2xl font-bold text-yellow-400">
                        {player.money.toLocaleString()} WD
                      </div>
                      <div className="text-sm text-gray-300">دلار جنگ</div>
                    </div>
                  </div>

                  <div className="bg-blue-600/20 rounded-lg p-4">
                    <h5 className="font-bold text-blue-400 mb-2" dir="rtl">منابع:</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(resourceNames).map(([key, name]) => (
                        <div key={key} className="flex justify-between text-white" dir="rtl">
                          <span>{name}:</span>
                          <span>{player.resources[key as keyof typeof player.resources].toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-600/20 rounded-lg p-4">
                    <h5 className="font-bold text-gray-400 mb-2" dir="rtl">اطلاعات حساب:</h5>
                    <div className="space-y-1 text-sm text-white">
                      <div>عضویت: {new Date(player.createdAt).toLocaleDateString('fa-IR')}</div>
                      <div>آخرین فعالیت: {new Date(player.lastActive).toLocaleString('fa-IR')}</div>
                      <div className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                        player.isSuspended 
                          ? 'bg-red-600/20 text-red-400' 
                          : 'bg-green-600/20 text-green-400'
                      }`}>
                        {player.isSuspended ? 'تعلیق شده' : 'فعال'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="text-center text-gray-400 py-8" dir="rtl">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>ابتدا بازیکن مورد نظر را انتخاب کنید</p>
            </div>
          )}
        </div>
      </div>

      {/* Action History */}
      <div className="bg-white/10 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4" dir="rtl">تاریخچه عملیات</h3>
        <div className="text-center text-gray-400 py-8" dir="rtl">
          <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>تاریخچه عملیات در آپدیت های آینده اضافه خواهد شد</p>
        </div>
      </div>
    </div>
  );
};

export default ItemGifting;