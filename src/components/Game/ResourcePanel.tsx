import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { Fuel, Wheat, Wrench, Zap, Users, Coins, Package, TrendingUp, TrendingDown, Plane, Shield, Anchor, LineChart as Submarine, Bolt, Ship } from 'lucide-react';

const ResourcePanel: React.FC = () => {
  const { state } = useGame();

  if (!state.currentUser) return null;

  const resources = [
    { key: 'oil', name: 'نفت', value: state.currentUser.resources.oil, icon: Fuel, color: 'text-black' },
    { key: 'food', name: 'غذا', value: state.currentUser.resources.food, icon: Wheat, color: 'text-yellow-600' },
    { key: 'metals', name: 'فلزات', value: state.currentUser.resources.metals, icon: Wrench, color: 'text-gray-600' },
    { key: 'weapons', name: 'سلاح', value: state.currentUser.resources.weapons, icon: Zap, color: 'text-red-600' },
    { key: 'soldiers', name: 'سرباز', value: state.currentUser.resources.soldiers, icon: Users, color: 'text-green-600' },
    { key: 'goods', name: 'کالا', value: state.currentUser.resources.goods, icon: Package, color: 'text-purple-600' },
    { key: 'aircraft', name: 'هواپیما', value: state.currentUser.resources.aircraft, icon: Plane, color: 'text-blue-600' },
    { key: 'tanks', name: 'تانک', value: state.currentUser.resources.tanks, icon: Shield, color: 'text-orange-600' },
    { key: 'missiles', name: 'موشک', value: state.currentUser.resources.missiles, icon: Anchor, color: 'text-red-700' },
    { key: 'submarines', name: 'زیردریایی', value: state.currentUser.resources.submarines, icon: Submarine, color: 'text-indigo-600' },
    { key: 'electricity', name: 'برق', value: state.currentUser.resources.electricity, icon: Bolt, color: 'text-yellow-500' },
    { key: 'ships', name: 'کشتی', value: state.currentUser.resources.ships, icon: Ship, color: 'text-cyan-600' }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4" dir="rtl">منابع و دارایی</h2>
      
      {/* Money */}
      <div className="bg-yellow-500/20 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between" dir="rtl">
          <div className="flex items-center space-x-2">
            <Coins className="w-6 h-6 text-yellow-400" />
            <span className="font-bold text-white">دلار جنگ</span>
          </div>
          <span className="text-2xl font-bold text-yellow-400">
            {state.currentUser.money.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Resources */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {resources.map((resource) => {
          const Icon = resource.icon;
          const production = state.gameSettings.dailyResourceProduction[resource.key as keyof typeof state.gameSettings.dailyResourceProduction];
          const consumption = state.gameSettings.dailyResourceConsumption[resource.key as keyof typeof state.gameSettings.dailyResourceConsumption];
          const netChange = production - consumption;
          
          return (
            <div key={resource.key} className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2" dir="rtl">
                <div className="flex items-center space-x-2">
                  <Icon className={`w-5 h-5 ${resource.color}`} />
                  <span className="font-medium text-white">{resource.name}</span>
                </div>
                <span className="font-bold text-white">
                  {resource.value.toLocaleString()}
                </span>
              </div>
              
              {/* Daily Production/Consumption */}
              <div className="flex items-center justify-between text-xs" dir="rtl">
                <div className="flex items-center space-x-1 text-green-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{production}</span>
                </div>
                <div className="flex items-center space-x-1 text-red-400">
                  <TrendingDown className="w-3 h-3" />
                  <span>-{consumption}</span>
                </div>
                <div className={`flex items-center space-x-1 font-bold ${netChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <span>{netChange >= 0 ? '+' : ''}{netChange}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Summary */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <h3 className="text-sm font-bold text-gray-300 mb-3" dir="rtl">خلاصه روزانه:</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-green-600/20 rounded p-2">
            <div className="text-green-400 font-bold mb-1" dir="rtl">تولید روزانه</div>
            <div className="space-y-1 text-gray-300" dir="rtl">
              <div>نفت: +{state.gameSettings.dailyResourceProduction.oil}</div>
              <div>غذا: +{state.gameSettings.dailyResourceProduction.food}</div>
              <div>فلز: +{state.gameSettings.dailyResourceProduction.metals}</div>
              <div>سلاح: +{state.gameSettings.dailyResourceProduction.weapons}</div>
              <div>سرباز: +{state.gameSettings.dailyResourceProduction.soldiers}</div>
              <div>کالا: +{state.gameSettings.dailyResourceProduction.goods}</div>
            </div>
          </div>
          
          <div className="bg-red-600/20 rounded p-2">
            <div className="text-red-400 font-bold mb-1" dir="rtl">مصرف روزانه</div>
            <div className="space-y-1 text-gray-300" dir="rtl">
              <div>نفت: -{state.gameSettings.dailyResourceConsumption.oil}</div>
              <div>غذا: -{state.gameSettings.dailyResourceConsumption.food}</div>
              <div>فلز: -{state.gameSettings.dailyResourceConsumption.metals}</div>
              <div>سلاح: -{state.gameSettings.dailyResourceConsumption.weapons}</div>
              <div>سرباز: -{state.gameSettings.dailyResourceConsumption.soldiers}</div>
              <div>کالا: -{state.gameSettings.dailyResourceConsumption.goods}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcePanel;