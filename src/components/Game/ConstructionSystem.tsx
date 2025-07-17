import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { 
  Factory, 
  Fuel, 
  Users, 
  Zap, 
  Plane, 
  Wrench, 
  Bolt, 
  Package, 
  Ship, 
  Anchor,
  ShoppingCart,
  Settings,
  Play,
  Pause,
  Plus,
  Minus,
  Clock,
  AlertTriangle,
  CheckCircle,
  Shield
} from 'lucide-react';

interface Building {
  id: string;
  type: string;
  level: number;
  isActive: boolean;
  productionQueue: ProductionOrder[];
  lastProduction: Date;
}

interface ProductionOrder {
  id: string;
  productType: string;
  quantity: number;
  startTime: Date;
  completionTime: Date;
  resourceCost: any;
}

const ConstructionSystem: React.FC = () => {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<'purchase' | 'manage'>('purchase');
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [productionOrders, setProductionOrders] = useState<{[key: string]: number}>({});

  if (!state.currentUser?.country) {
    return (
      <div className="text-center py-8">
        <Factory className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-white" dir="rtl">ابتدا کشور خود را انتخاب کنید</p>
      </div>
    );
  }

  const userBuildings = state.currentUser?.buildings || {
    oilRefinery: 1, // Default buildings
    militaryBarracks: 1,
    metalMine: 1,
    missileFactory: 0,
    aircraftFactory: 0,
    tankFactory: 0,
    powerPlant: 0,
    goodsFactory: 0,
    shipyard: 0,
    submarineFactory: 0,
    defenseSystem: 0
  };

  const buildingTypes = [
    {
      key: 'oilRefinery',
      name: 'پالایشگاه نفت',
      icon: Fuel,
      color: 'text-black',
      bgColor: 'bg-gray-800/20',
      description: 'تولید نفت',
      produces: 'oil',
      productionRate: 50, // per 20 seconds
      resourceCost: { metals: 20, electricity: 10 },
      price: 15000,
      isDefault: true
    },
    {
      key: 'militaryBarracks',
      name: 'اردوگاه سرباز',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-600/20',
      description: 'تولید سرباز',
      produces: 'soldiers',
      productionRate: 100,
      resourceCost: { food: 50, weapons: 10 },
      price: 20000,
      isDefault: true
    },
    {
      key: 'metalMine',
      name: 'معدن فلزات',
      icon: Wrench,
      color: 'text-gray-600',
      bgColor: 'bg-gray-600/20',
      description: 'تولید فلزات',
      produces: 'metals',
      productionRate: 30,
      resourceCost: { electricity: 15 },
      price: 18000,
      isDefault: true
    },
    {
      key: 'missileFactory',
      name: 'کارخانه ساخت موشک',
      icon: Zap,
      color: 'text-red-600',
      bgColor: 'bg-red-600/20',
      description: 'تولید موشک',
      produces: 'missiles',
      productionRate: 5,
      resourceCost: { metals: 30, electricity: 20 },
      price: 35000
    },
    {
      key: 'aircraftFactory',
      name: 'کارخانه ساخت هواپیما',
      icon: Plane,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/20',
      description: 'تولید هواپیما',
      produces: 'aircraft',
      productionRate: 2,
      resourceCost: { metals: 50, electricity: 30 },
      price: 50000
    },
    {
      key: 'tankFactory',
      name: 'کارخانه ساخت تانک',
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-600/20',
      description: 'تولید تانک',
      produces: 'tanks',
      productionRate: 3,
      resourceCost: { metals: 40, electricity: 25 },
      price: 45000
    },
    {
      key: 'powerPlant',
      name: 'نیروگاه برق',
      icon: Bolt,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-600/20',
      description: 'تولید برق',
      produces: 'electricity',
      productionRate: 100,
      resourceCost: { oil: 30 },
      price: 25000
    },
    {
      key: 'goodsFactory',
      name: 'کارخانه تولید کالا',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600/20',
      description: 'تولید کالا',
      produces: 'goods',
      productionRate: 40,
      resourceCost: { metals: 15, electricity: 10 },
      price: 22000
    },
    {
      key: 'shipyard',
      name: 'کارخانه ساخت کشتی',
      icon: Ship,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-600/20',
      description: 'تولید کشتی',
      produces: 'ships',
      productionRate: 1,
      resourceCost: { metals: 60, electricity: 35 },
      price: 60000
    },
    {
      key: 'submarineFactory',
      name: 'کارخانه ساخت زیردریایی',
      icon: Anchor,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-600/20',
      description: 'تولید زیردریایی',
      produces: 'submarines',
      productionRate: 1,
      resourceCost: { metals: 80, electricity: 50 },
      price: 80000
    },
    {
      key: 'defenseSystem',
      name: 'سیستم پدافند',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600/20',
      description: 'تولید سیستم دفاعی',
      produces: 'defense',
      productionRate: 10,
      resourceCost: { metals: 40, electricity: 30, weapons: 20 },
      price: 70000
    }
  ];

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
    ships: 'کشتی',
    defense: 'پدافند'
  };

  const handlePurchaseBuilding = (buildingType: string) => {
    const building = buildingTypes.find(b => b.key === buildingType);
    if (!building) return;

    if (userBuildings[buildingType as keyof typeof userBuildings] > 0) {
      alert('شما قبلاً این ساختمان را خریداری کرده‌اید');
      return;
    }

    if (state.currentUser!.money < building.price) {
      alert('پول کافی برای خرید این ساختمان ندارید');
      return;
    }

    const updatedUser = {
      ...state.currentUser!,
      money: state.currentUser!.money - building.price,
      buildings: {
        ...userBuildings,
        [buildingType]: 1
      }
    };

    const updatedUsers = state.users.map(u => 
      u.id === state.currentUser!.id ? updatedUser : u
    );

    dispatch({ type: 'LOAD_DATA', payload: { users: updatedUsers, currentUser: updatedUser } });
    alert(`${building.name} با موفقیت خریداری شد!`);
  };

  const handleStartProduction = (buildingType: string) => {
    const building = buildingTypes.find(b => b.key === buildingType);
    const quantity = productionOrders[buildingType] || 1;
    
    if (!building || quantity <= 0) return;

    const totalCost = Object.entries(building.resourceCost).reduce((acc, [resource, cost]) => {
      acc[resource] = (cost as number) * quantity;
      return acc;
    }, {} as any);

    // Check if user has enough resources
    for (const [resource, cost] of Object.entries(totalCost)) {
      if (state.currentUser!.resources[resource as keyof typeof state.currentUser.resources] < cost) {
        alert(`${resourceNames[resource as keyof typeof resourceNames]} کافی ندارید`);
        return;
      }
    }

    // Deduct resources
    const updatedResources = { ...state.currentUser!.resources };
    for (const [resource, cost] of Object.entries(totalCost)) {
      updatedResources[resource as keyof typeof updatedResources] -= cost;
    }

    const updatedUser = {
      ...state.currentUser!,
      resources: updatedResources
    };

    const updatedUsers = state.users.map(u => 
      u.id === state.currentUser!.id ? updatedUser : u
    );

    dispatch({ type: 'LOAD_DATA', payload: { users: updatedUsers, currentUser: updatedUser } });

    // Start production timer (simplified - in real app would be more complex)
    setTimeout(() => {
      const finalUser = state.users.find(u => u.id === state.currentUser!.id);
      if (finalUser) {
        const finalUpdatedResources = {
          ...finalUser.resources,
          [building.produces]: finalUser.resources[building.produces as keyof typeof finalUser.resources] + (building.productionRate * quantity)
        };

        const finalUpdatedUser = {
          ...finalUser,
          resources: finalUpdatedResources
        };

        const finalUpdatedUsers = state.users.map(u => 
          u.id === state.currentUser!.id ? finalUpdatedUser : u
        );

        dispatch({ type: 'LOAD_DATA', payload: { users: finalUpdatedUsers, currentUser: finalUpdatedUser } });
      }
    }, 20000); // 20 seconds

    alert(`تولید ${quantity} ${resourceNames[building.produces as keyof typeof resourceNames]} شروع شد`);
    setProductionOrders(prev => ({ ...prev, [buildingType]: 1 }));
  };

  const renderPurchaseTab = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2" dir="rtl">خرید ساختمان‌ها</h3>
        <p className="text-gray-300" dir="rtl">ساختمان‌های جدید خریداری کنید</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buildingTypes.map((building) => {
          const Icon = building.icon;
          const owned = userBuildings[building.key as keyof typeof userBuildings] > 0;
          const canAfford = state.currentUser!.money >= building.price;

          return (
            <div key={building.key} className={`${building.bgColor} rounded-xl p-6 border border-gray-600 ${owned ? 'opacity-50' : ''}`}>
              <div className="text-center mb-4">
                <div className={`w-16 h-16 ${building.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`w-8 h-8 ${building.color}`} />
                </div>
                <h4 className="text-lg font-bold text-white" dir="rtl">{building.name}</h4>
                <p className="text-sm text-gray-300" dir="rtl">{building.description}</p>
              </div>

              <div className="mb-4">
                <div className="bg-white/10 rounded-lg p-3 mb-3">
                  <div className="text-sm text-white" dir="rtl">
                    <div className="font-bold mb-1">تولید:</div>
                    <div>+{building.productionRate} {resourceNames[building.produces as keyof typeof resourceNames]} / 20 ثانیه</div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-3 mb-3">
                  <div className="text-sm text-white" dir="rtl">
                    <div className="font-bold mb-1">مصرف منابع:</div>
                    {Object.entries(building.resourceCost).map(([resource, cost]) => (
                      <div key={resource}>
                        -{cost} {resourceNames[resource as keyof typeof resourceNames]}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">
                    {building.price.toLocaleString()} WD
                  </div>
                  {building.isDefault && (
                    <div className="text-xs text-green-400">پیش‌فرض</div>
                  )}
                </div>
              </div>

              <button
                onClick={() => handlePurchaseBuilding(building.key)}
                disabled={owned || !canAfford}
                className={`w-full py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center space-x-2 ${
                  owned
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : canAfford
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 text-white cursor-not-allowed'
                }`}
              >
                {owned ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>خریداری شده</span>
                  </>
                ) : canAfford ? (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>خرید</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>پول کافی نیست</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderManageTab = () => {
    const ownedBuildings = buildingTypes.filter(b => 
      userBuildings[b.key as keyof typeof userBuildings] > 0
    );

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2" dir="rtl">ساختمان‌های شما</h3>
          <p className="text-gray-300" dir="rtl">ساختمان‌های خود را مدیریت کنید - بدون محدودیت تعداد سفارش</p>
        </div>

        {ownedBuildings.length === 0 ? (
          <div className="text-center text-gray-400 py-8" dir="rtl">
            <Factory className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>هنوز ساختمانی نخریده‌اید</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ownedBuildings.map((building) => {
              const Icon = building.icon;
              const quantity = productionOrders[building.key] || 1;
              const totalCost = Object.entries(building.resourceCost).reduce((acc, [resource, cost]) => {
                acc[resource] = (cost as number) * quantity;
                return acc;
              }, {} as any);

              const canProduce = Object.entries(totalCost).every(([resource, cost]) => 
                state.currentUser!.resources[resource as keyof typeof state.currentUser.resources] >= cost
              );

              return (
                <div key={building.key} className={`${building.bgColor} rounded-xl p-6 border border-gray-600`}>
                  <div className="flex items-center space-x-3 mb-4" dir="rtl">
                    <Icon className={`w-8 h-8 ${building.color}`} />
                    <div>
                      <h4 className="text-lg font-bold text-white">{building.name}</h4>
                      <p className="text-sm text-gray-300">فعال</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-sm text-white" dir="rtl">
                        <div className="font-bold mb-2">تولید:</div>
                        <div>+{building.productionRate * quantity} {resourceNames[building.produces as keyof typeof resourceNames]} / 20 ثانیه</div>
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-sm text-white" dir="rtl">
                        <div className="font-bold mb-2">مصرف کل:</div>
                        {Object.entries(totalCost).map(([resource, cost]) => (
                          <div key={resource} className={
                            state.currentUser!.resources[resource as keyof typeof state.currentUser.resources] >= cost
                              ? 'text-green-400'
                              : 'text-red-400'
                          }>
                            -{cost} {resourceNames[resource as keyof typeof resourceNames]} 
                            (موجود: {state.currentUser!.resources[resource as keyof typeof state.currentUser.resources].toLocaleString()})
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-sm text-white mb-3" dir="rtl">
                        <div className="font-bold">تعداد سفارش (بدون محدودیت):</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setProductionOrders(prev => ({
                            ...prev,
                            [building.key]: Math.max(1, (prev[building.key] || 1) - 1)
                          }))}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setProductionOrders(prev => ({
                            ...prev,
                            [building.key]: Math.max(1, parseInt(e.target.value) || 1)
                          }))}
                          min="1"
                          className="bg-white/10 border border-gray-600 rounded px-3 py-2 text-white text-center w-20"
                          dir="rtl"
                        />
                        <button
                          onClick={() => setProductionOrders(prev => ({
                            ...prev,
                            [building.key]: (prev[building.key] || 1) + 1
                          }))}
                          className="bg-green-600 hover:bg-green-700 text-white p-2 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartProduction(building.key)}
                      disabled={!canProduce}
                      className={`w-full py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center space-x-2 ${
                        canProduce
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Play className="w-4 h-4" />
                      <span>شروع تولید</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Production Summary */}
        <div className="bg-white/10 rounded-xl p-6">
          <h4 className="text-xl font-bold text-white mb-4" dir="rtl">خلاصه تولیدات</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(resourceNames).map(([key, name]) => {
              const totalProduction = ownedBuildings
                .filter(b => b.produces === key)
                .reduce((sum, b) => sum + b.productionRate, 0);
              
              const totalConsumption = ownedBuildings
                .reduce((sum, b) => {
                  const consumption = b.resourceCost[key] || 0;
                  return sum + consumption;
                }, 0);

              const netProduction = totalProduction - totalConsumption;

              return (
                <div key={key} className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-white font-medium text-sm mb-1">{name}</div>
                  <div className={`font-bold ${netProduction >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {netProduction >= 0 ? '+' : ''}{netProduction}/20s
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white/10 rounded-xl p-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('purchase')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'purchase'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>خرید ساختمان</span>
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'manage'
                ? 'bg-green-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>ساختمان‌های شما</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white/10 rounded-xl p-6">
        {activeTab === 'purchase' && renderPurchaseTab()}
        {activeTab === 'manage' && renderManageTab()}
      </div>
    </div>
  );
};

export default ConstructionSystem;