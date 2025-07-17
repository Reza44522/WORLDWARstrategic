import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { TrendingUp, TrendingDown, DollarSign, Fuel, Wheat, Wrench, Zap, Users, Package, Plane, Shield, Anchor, LineChart as Submarine, Bolt, Ship } from 'lucide-react';

const MarketPrices: React.FC = () => {
  const { state } = useGame();

  const resources = [
    { key: 'oil', name: 'نفت', icon: Fuel, color: 'text-black' },
    { key: 'food', name: 'غذا', icon: Wheat, color: 'text-yellow-600' },
    { key: 'metals', name: 'فلزات', icon: Wrench, color: 'text-gray-600' },
    { key: 'weapons', name: 'سلاح', icon: Zap, color: 'text-red-600' },
    { key: 'soldiers', name: 'سرباز', icon: Users, color: 'text-green-600' },
    { key: 'goods', name: 'کالا', icon: Package, color: 'text-purple-600' },
    { key: 'aircraft', name: 'هواپیما', icon: Plane, color: 'text-blue-600' },
    { key: 'tanks', name: 'تانک', icon: Shield, color: 'text-orange-600' },
    { key: 'missiles', name: 'موشک', icon: Anchor, color: 'text-red-700' },
    { key: 'submarines', name: 'زیردریایی', icon: Submarine, color: 'text-indigo-600' },
    { key: 'electricity', name: 'برق', icon: Bolt, color: 'text-yellow-500' },
    { key: 'ships', name: 'کشتی', icon: Ship, color: 'text-cyan-600' }
  ];

  return (
    <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2" dir="rtl">
          <TrendingUp className="w-6 h-6 text-green-400" />
          <span>قیمت های بازار امروز</span>
        </h2>
        <div className="text-sm text-gray-300" dir="rtl">
          آخرین بروزرسانی: {new Date().toLocaleTimeString('fa-IR')}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {resources.map((resource) => {
          const Icon = resource.icon;
          const price = state.gameSettings.marketPrices[resource.key as keyof typeof state.gameSettings.marketPrices];
          
          return (
            <div key={resource.key} className="bg-white/10 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Icon className={`w-6 h-6 ${resource.color}`} />
              </div>
              <div className="text-white font-bold text-sm mb-1" dir="rtl">
                {resource.name}
              </div>
              <div className="flex items-center justify-center space-x-1">
                <DollarSign className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-bold">
                  {price}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1" dir="rtl">
                هر واحد
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-300" dir="rtl">
          💡 قیمت ها به صورت خودکار روزانه تغییر می‌کنند
        </p>
      </div>
    </div>
  );
};

export default MarketPrices;