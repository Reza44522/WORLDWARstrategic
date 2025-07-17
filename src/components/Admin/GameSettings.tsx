import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { Settings, Save, RotateCcw, AlertTriangle, TrendingUp, DollarSign, Shield, Clock, Factory, Bot } from 'lucide-react';

const GameSettings: React.FC = () => {
  const { state, dispatch } = useGame();
  const [settings, setSettings] = useState(state.gameSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: number | Date) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleResourceChange = (resource: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      dailyResourceProduction: {
        ...prev.dailyResourceProduction,
        [resource]: value
      }
    }));
    setHasChanges(true);
  };

  const handleConsumptionChange = (resource: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      dailyResourceConsumption: {
        ...prev.dailyResourceConsumption,
        [resource]: value
      }
    }));
    setHasChanges(true);
  };

  const handleInitialResourceChange = (resource: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      initialResources: {
        ...prev.initialResources,
        [resource]: value
      }
    }));
    setHasChanges(true);
  };

  const handleMarketPriceChange = (resource: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      marketPrices: {
        ...prev.marketPrices,
        [resource]: value
      }
    }));
    setHasChanges(true);
  };

  const handleBuildingPriceChange = (building: string, level: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      buildingPrices: {
        ...prev.buildingPrices,
        [building]: {
          ...prev.buildingPrices[building as keyof typeof prev.buildingPrices],
          [level]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    dispatch({ type: 'LOAD_DATA', payload: { gameSettings: settings } });
    setHasChanges(false);
    alert('تنظیمات با موفقیت ذخیره شد');
  };

  const handleReset = () => {
    if (confirm('آیا می‌خواهید فصل بازی را ریست کنید؟ تمام اطلاعات بازیکنان حذف خواهد شد.')) {
      // Reset game
      const resetData = {
        users: [],
        countries: state.countries.map(c => ({ ...c, isOccupied: false, occupiedBy: undefined })),
        chatMessages: [],
        alliances: [],
        trades: [],
        wars: [],
        tradeProposals: [],
        supportRequests: [],
        supportTickets: [],
        gameEvents: [],
        peaceProposals: [],
        allianceInvitations: [],
        gameSettings: {
          ...settings,
          seasonStartDate: new Date()
        }
      };
      dispatch({ type: 'LOAD_DATA', payload: resetData });
      alert('فصل بازی ریست شد');
    }
  };

  const resourceNames = {
    oil: 'نفت',
    food: 'غذا',
    metals: 'فلزات',
    weapons: 'سلاح',
    soldiers: 'سرباز',
    goods: 'کالا'
  };

  const buildingNames = {
    oilRefinery: 'پالایشگاه نفت',
    militaryBarracks: 'اردوگاه سرباز',
    missileFactory: 'کارخانه موشک',
    aircraftFactory: 'کارخانه هواپیما',
    metalMine: 'معدن فلزات',
    powerPlant: 'نیروگاه برق'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white" dir="rtl">تنظیمات بازی</h2>
        <div className="flex space-x-2">
          {hasChanges && (
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره</span>
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ریست فصل</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2" dir="rtl">
            <Settings className="w-6 h-6" />
            <span>تنظیمات عمومی</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                حداکثر تعداد بازیکنان
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={settings.maxPlayers}
                onChange={(e) => handleChange('maxPlayers', parseInt(e.target.value))}
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                مدت فصل بازی (روز)
              </label>
              <input
                type="number"
                min="7"
                max="90"
                value={settings.seasonDuration}
                onChange={(e) => handleChange('seasonDuration', parseInt(e.target.value))}
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                تاریخ شروع فصل
              </label>
              <input
                type="datetime-local"
                value={new Date(settings.seasonStartDate).toISOString().slice(0, 16)}
                onChange={(e) => handleChange('seasonStartDate', new Date(e.target.value))}
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                پول اولیه بازیکنان (WD)
              </label>
              <input
                type="number"
                min="1000"
                max="100000"
                step="1000"
                value={settings.initialMoney}
                onChange={(e) => handleChange('initialMoney', parseInt(e.target.value))}
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>زمان محافظت کشور جدید (دقیقه)</span>
                </div>
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={Math.floor(settings.shieldProtectionTime / 60000)}
                onChange={(e) => handleChange('shieldProtectionTime', parseInt(e.target.value) * 60000)}
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1" dir="rtl">
                مدت زمانی که کشور جدید انتخاب شده در برابر حمله محافظت می‌شود
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4" />
                  <span>درصد خرید ربات (%)</span>
                </div>
              </label>
              <input
                type="number"
                min="10"
                max="90"
                value={settings.robotBuybackPercentage}
                onChange={(e) => handleChange('robotBuybackPercentage', parseInt(e.target.value))}
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1" dir="rtl">
                درصدی از قیمت بازار که ربات منابع را می‌خرد
              </p>
            </div>
          </div>
        </div>

        {/* Market Prices */}
        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2" dir="rtl">
            <DollarSign className="w-6 h-6" />
            <span>قیمت های بازار</span>
          </h3>
          
          <div className="space-y-4">
            {Object.entries(resourceNames).map(([key, name]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                  {name} (WD)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.marketPrices[key as keyof typeof settings.marketPrices]}
                  onChange={(e) => handleMarketPriceChange(key, parseInt(e.target.value))}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Building Prices */}
        <div className="bg-white/10 rounded-lg p-6 lg:col-span-2">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2" dir="rtl">
            <Factory className="w-6 h-6" />
            <span>قیمت ساختمان‌ها</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(buildingNames).map(([buildingKey, buildingName]) => (
              <div key={buildingKey} className="bg-white/5 rounded-lg p-4">
                <h4 className="font-bold text-white mb-3 text-center" dir="rtl">{buildingName}</h4>
                <div className="space-y-3">
                  {['level1', 'level2', 'level3'].map((level, index) => (
                    <div key={level}>
                      <label className="block text-sm font-medium text-gray-300 mb-1" dir="rtl">
                        سطح {index + 1}:
                      </label>
                      <input
                        type="number"
                        min="1000"
                        max="100000"
                        step="1000"
                        value={settings.buildingPrices[buildingKey as keyof typeof settings.buildingPrices][level as 'level1' | 'level2' | 'level3']}
                        onChange={(e) => handleBuildingPriceChange(buildingKey, level, parseInt(e.target.value))}
                        className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Production */}
        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2" dir="rtl">
            <TrendingUp className="w-6 h-6" />
            <span>تولید روزانه منابع</span>
          </h3>
          
          <div className="space-y-4">
            {Object.entries(resourceNames).map(([key, name]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">{name}</label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={settings.dailyResourceProduction[key as keyof typeof settings.dailyResourceProduction]}
                  onChange={(e) => handleResourceChange(key, parseInt(e.target.value))}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Resource Consumption */}
        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4" dir="rtl">مصرف روزانه منابع</h3>
          
          <div className="space-y-4">
            {Object.entries(resourceNames).map(([key, name]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">{name}</label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={settings.dailyResourceConsumption[key as keyof typeof settings.dailyResourceConsumption]}
                  onChange={(e) => handleConsumptionChange(key, parseInt(e.target.value))}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Initial Resources */}
        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4" dir="rtl">منابع اولیه بازیکنان</h3>
          
          <div className="space-y-4">
            {Object.entries(resourceNames).map(([key, name]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">{name}</label>
                <input
                  type="number"
                  min="100"
                  max="200000"
                  step="100"
                  value={settings.initialResources[key as keyof typeof settings.initialResources]}
                  onChange={(e) => handleInitialResourceChange(key, parseInt(e.target.value))}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-600/20 border border-red-500 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4" dir="rtl">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-bold text-red-400">هشدار مهم</h3>
          </div>
          
          <div className="text-sm text-red-300 space-y-2" dir="rtl">
            <p>• تغییر تنظیمات بر روی بازیکنان فعلی تأثیر نمی‌گذارد</p>
            <p>• تنظیمات جدید فقط برای بازیکنان جدید اعمال می‌شود</p>
            <p>• قیمت های بازار به صورت خودکار روزانه تغییر می‌کنند</p>
            <p>• قیمت ساختمان‌ها بر روی تمام بازیکنان اعمال می‌شود</p>
            <p>• ریست فصل تمام اطلاعات بازیکنان را حذف می‌کند</p>
            <p>• قبل از ریست حتماً از اطلاعات مهم پشتیبان بگیرید</p>
            <p>• زمان محافظت کشور جدید قابل تنظیم است</p>
            <p>• درصد خرید ربات تعیین می‌کند ربات چه درصدی از قیمت بازار منابع را می‌خرد</p>
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-yellow-600/20 border border-yellow-500 rounded-lg p-4">
          <div className="flex items-center space-x-2" dir="rtl">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-medium">تغییرات ذخیره نشده دارید</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameSettings;