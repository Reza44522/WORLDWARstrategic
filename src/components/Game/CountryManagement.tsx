import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { 
  Crown, 
  Swords, 
  Shield, 
  Handshake, 
  TrendingUp, 
  Users, 
  DollarSign,
  Factory,
  Fuel,
  Zap,
  Plane,
  Pickaxe,
  Building,
  ArrowUp,
  CheckCircle,
  AlertCircle,
  Hammer
} from 'lucide-react';
import WarDeclaration from './WarDeclaration';
import PeaceProposals from './PeaceProposals';
import AllianceManagement from './AllianceManagement';
import MarketTrading from './MarketTrading';
import SupportSystem from './SupportSystem';
import ConstructionSystem from './ConstructionSystem';

const CountryManagement: React.FC = () => {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<'overview' | 'war' | 'peace' | 'alliance' | 'market' | 'support' | 'upgrade' | 'construction'>('overview');

  if (!state.currentUser?.country) {
    return (
      <div className="text-center py-12">
        <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2" dir="rtl">ابتدا کشور خود را انتخاب کنید</h2>
        <p className="text-gray-400" dir="rtl">برای دسترسی به مدیریت کشور، ابتدا باید یک کشور انتخاب کنید</p>
      </div>
    );
  }

  const currentCountry = state.countries.find(c => c.id === state.currentUser?.country);
  const userBuildings = state.currentUser?.buildings || {
    oilRefinery: 1,
    militaryBarracks: 1,
    metalMine: 1,
    missileFactory: 0,
    aircraftFactory: 0,
    powerPlant: 0,
    defenseSystem: 0
  };

  const buildingTypes = [
    {
      key: 'oilRefinery',
      name: 'پالایشگاه نفت',
      icon: Fuel,
      color: 'text-black',
      bgColor: 'bg-gray-800/20',
      description: 'افزایش تولید روزانه نفت',
      productionBonus: (level: number) => level * 50
    },
    {
      key: 'militaryBarracks',
      name: 'اردوگاه سرباز',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-600/20',
      description: 'افزایش تولید روزانه سرباز',
      productionBonus: (level: number) => level * 200
    },
    {
      key: 'missileFactory',
      name: 'کارخانه موشک',
      icon: Zap,
      color: 'text-red-600',
      bgColor: 'bg-red-600/20',
      description: 'افزایش تولید روزانه سلاح',
      productionBonus: (level: number) => level * 30
    },
    {
      key: 'aircraftFactory',
      name: 'کارخانه هواپیما',
      icon: Plane,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/20',
      description: 'افزایش قدرت نظامی',
      productionBonus: (level: number) => level * 10
    },
    {
      key: 'metalMine',
      name: 'معدن فلزات',
      icon: Pickaxe,
      color: 'text-gray-600',
      bgColor: 'bg-gray-600/20',
      description: 'افزایش تولید روزانه فلزات',
      productionBonus: (level: number) => level * 40
    },
    {
      key: 'powerPlant',
      name: 'نیروگاه برق',
      icon: Building,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-600/20',
      description: 'افزایش کل تولیدات',
      productionBonus: (level: number) => level * 5 // percentage boost
    },
    {
      key: 'defenseSystem',
      name: 'سیستم پدافند',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600/20',
      description: 'دفاع در برابر حملات هوایی',
      productionBonus: (level: number) => level * 20 // defense points
    }
  ];

  const upgradeBuilding = (buildingType: string) => {
    const currentLevel = userBuildings[buildingType as keyof typeof userBuildings];
    if (currentLevel >= 5) {
      alert('این ساختمان به حداکثر سطح رسیده است');
      return;
    }

    const nextLevel = currentLevel + 1;
    const levelKey = `level${nextLevel}` as 'level1' | 'level2' | 'level3' | 'level4' | 'level5';
    const cost = state.gameSettings.buildingPrices[buildingType as keyof typeof state.gameSettings.buildingPrices][levelKey];

    if (state.currentUser!.money < cost) {
      alert('پول کافی برای ارتقا ندارید');
      return;
    }

    // Update user buildings and money
    const updatedUser = {
      ...state.currentUser!,
      money: state.currentUser!.money - cost,
      buildings: {
        ...userBuildings,
        [buildingType]: nextLevel
      }
    };

    const updatedUsers = state.users.map(u => 
      u.id === state.currentUser!.id ? updatedUser : u
    );

    dispatch({ type: 'LOAD_DATA', payload: { users: updatedUsers, currentUser: updatedUser } });

    // Create news item
    const buildingName = buildingTypes.find(b => b.key === buildingType)?.name || buildingType;
    const newsItem = {
      id: Date.now().toString(),
      type: 'upgrade' as const,
      title: `ارتقا ساختمان`,
      description: `${state.currentUser!.username} ${buildingName} خود را به سطح ${nextLevel} ارتقا داد`,
      involvedCountries: [currentCountry?.name || ''],
      involvedPlayers: [state.currentUser!.username],
      timestamp: new Date(),
      importance: 'medium' as const
    };

    const currentNews = JSON.parse(localStorage.getItem('worldWarNews') || '[]');
    localStorage.setItem('worldWarNews', JSON.stringify([newsItem, ...currentNews]));

    alert(`${buildingName} با موفقیت به سطح ${nextLevel} ارتقا یافت!`);
  };

  const getBuildingCost = (buildingType: string, currentLevel: number) => {
    if (currentLevel >= 5) return 0;
    const nextLevel = currentLevel + 1;
    const levelKey = `level${nextLevel}` as 'level1' | 'level2' | 'level3' | 'level4' | 'level5';
    return state.gameSettings.buildingPrices[buildingType as keyof typeof state.gameSettings.buildingPrices][levelKey];
  };

  const renderUpgradeTab = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2" dir="rtl">ارتقا ساختمان‌ها</h3>
        <p className="text-gray-300" dir="rtl">ساختمان‌های خود را تا سطح 5 ارتقا دهید</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buildingTypes.map((building) => {
          const Icon = building.icon;
          const currentLevel = userBuildings[building.key as keyof typeof userBuildings];
          const cost = getBuildingCost(building.key, currentLevel);
          const canUpgrade = currentLevel < 5 && state.currentUser!.money >= cost;
          const currentBonus = building.productionBonus(currentLevel);
          const nextBonus = building.productionBonus(currentLevel + 1);

          return (
            <div key={building.key} className={`${building.bgColor} rounded-xl p-6 border border-gray-600`}>
              <div className="text-center mb-4">
                <div className={`w-16 h-16 ${building.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`w-8 h-8 ${building.color}`} />
                </div>
                <h4 className="text-lg font-bold text-white" dir="rtl">{building.name}</h4>
                <p className="text-sm text-gray-300" dir="rtl">{building.description}</p>
              </div>

              {/* Current Level */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2" dir="rtl">
                  <span className="text-white font-medium">سطح فعلی:</span>
                  <span className="text-yellow-400 font-bold">{currentLevel}</span>
                </div>
                
                <div className="flex space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`flex-1 h-2 rounded ${
                        level <= currentLevel ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {currentLevel > 0 && (
                  <div className="text-sm text-green-400" dir="rtl">
                    تولید اضافی: +{currentBonus} {building.key === 'powerPlant' ? '%' : building.key === 'defenseSystem' ? 'دفاع' : 'واحد'}
                  </div>
                )}
              </div>

              {/* Upgrade Section */}
              {currentLevel < 5 ? (
                <div className="space-y-3">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2" dir="rtl">
                      <span className="text-white text-sm">سطح بعدی:</span>
                      <span className="text-blue-400 font-bold">{currentLevel + 1}</span>
                    </div>
                    <div className="text-sm text-blue-300" dir="rtl">
                      تولید اضافی: +{nextBonus} {building.key === 'powerPlant' ? '%' : building.key === 'defenseSystem' ? 'دفاع' : 'واحد'}
                    </div>
                    <div className="flex justify-between items-center mt-2" dir="rtl">
                      <span className="text-gray-300 text-sm">هزینه:</span>
                      <span className="text-yellow-400 font-bold">{cost.toLocaleString()} WD</span>
                    </div>
                  </div>

                  <button
                    onClick={() => upgradeBuilding(building.key)}
                    disabled={!canUpgrade}
                    className={`w-full py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center space-x-2 ${
                      canUpgrade
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {canUpgrade ? (
                      <>
                        <ArrowUp className="w-4 h-4" />
                        <span>ارتقا</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        <span>{state.currentUser!.money < cost ? 'پول کافی نیست' : 'حداکثر سطح'}</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="bg-green-600/20 rounded-lg p-3 text-center">
                  <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <span className="text-green-400 font-bold" dir="rtl">حداکثر سطح</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Building Summary */}
      <div className="bg-white/10 rounded-xl p-6">
        <h4 className="text-xl font-bold text-white mb-4" dir="rtl">خلاصه ساختمان‌ها</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {buildingTypes.map((building) => {
            const currentLevel = userBuildings[building.key as keyof typeof userBuildings];
            const Icon = building.icon;
            
            return (
              <div key={building.key} className="bg-white/5 rounded-lg p-3 text-center">
                <Icon className={`w-6 h-6 ${building.color} mx-auto mb-2`} />
                <div className="text-white font-medium text-sm" dir="rtl">{building.name}</div>
                <div className="text-yellow-400 font-bold">سطح {currentLevel}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">{currentCountry?.flag}</div>
        <h2 className="text-3xl font-bold text-white mb-2" dir="rtl">{currentCountry?.name}</h2>
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2 bg-yellow-500/20 px-4 py-2 rounded-lg">
            <Crown className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-bold">قدرت: {currentCountry?.power}</span>
          </div>
          <div className="flex items-center space-x-2 bg-green-500/20 px-4 py-2 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-white font-bold">{state.currentUser?.money?.toLocaleString()} WD</span>
          </div>
          <div className="flex items-center space-x-2 bg-purple-500/20 px-4 py-2 rounded-lg">
            <Shield className="w-5 h-5 text-purple-400" />
            <span className="text-white font-bold">پدافند: {state.currentUser?.resources.defense || 0}</span>
          </div>
        </div>
      </div>

      {/* Buildings Summary */}
      <div className="bg-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2" dir="rtl">
          <Factory className="w-6 h-6" />
          <span>ساختمان‌های شما</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {buildingTypes.map((building) => {
            const currentLevel = userBuildings[building.key as keyof typeof userBuildings];
            const Icon = building.icon;
            
            return (
              <div key={building.key} className={`${building.bgColor} rounded-lg p-4 text-center`}>
                <Icon className={`w-8 h-8 ${building.color} mx-auto mb-2`} />
                <div className="text-white font-medium text-sm mb-1" dir="rtl">{building.name}</div>
                <div className="text-yellow-400 font-bold">سطح {currentLevel}</div>
                {currentLevel > 0 && (
                  <div className="text-xs text-green-400 mt-1" dir="rtl">
                    +{building.productionBonus(currentLevel)} {building.key === 'powerPlant' ? '%' : building.key === 'defenseSystem' ? 'دفاع' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600/20 rounded-xl p-6 text-center">
          <Swords className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2" dir="rtl">وضعیت جنگ</h3>
          <p className="text-blue-300" dir="rtl">
            {state.wars.filter(w => 
              (w.aggressor === state.currentUser?.id || w.defender === state.currentUser?.id) && 
              w.status === 'active'
            ).length} جنگ فعال
          </p>
        </div>

        <div className="bg-green-600/20 rounded-xl p-6 text-center">
          <Users className="w-8 h-8 text-green-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2" dir="rtl">اتحادها</h3>
          <p className="text-green-300" dir="rtl">
            {state.alliances.filter(a => a.members.includes(state.currentUser?.id || '')).length} اتحاد
          </p>
        </div>

        <div className="bg-purple-600/20 rounded-xl p-6 text-center">
          <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2" dir="rtl">معاملات</h3>
          <p className="text-purple-300" dir="rtl">
            {state.tradeProposals.filter(t => 
              t.proposer === state.currentUser?.id && t.status === 'active'
            ).length} پیشنهاد فعال
          </p>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'نمای کلی', icon: Crown },
    { id: 'upgrade', label: 'ارتقا', icon: Factory },
    { id: 'construction', label: 'ساخت و ساز', icon: Hammer },
    { id: 'war', label: 'اعلام جنگ', icon: Swords },
    { id: 'peace', label: 'پیشنهاد صلح', icon: Shield },
    { id: 'alliance', label: 'تشکیل اتحاد', icon: Handshake },
    { id: 'market', label: 'بازار', icon: TrendingUp },
    { id: 'support', label: 'حمایت', icon: Users }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white/10 rounded-xl p-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white/10 rounded-xl p-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'upgrade' && renderUpgradeTab()}
        {activeTab === 'construction' && <ConstructionSystem />}
        {activeTab === 'war' && <WarDeclaration />}
        {activeTab === 'peace' && <PeaceProposals />}
        {activeTab === 'alliance' && <AllianceManagement />}
        {activeTab === 'market' && <MarketTrading />}
        {activeTab === 'support' && <SupportSystem />}
      </div>
    </div>
  );
};

export default CountryManagement;