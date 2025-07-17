import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { Swords, Users, AlertTriangle, Crown, Shield, Clock, Plus, Send, BarChart3 } from 'lucide-react';
import { War, WarReinforcement, BattleStatistics } from '../../types';

const WarDeclaration: React.FC = () => {
  const { state, dispatch } = useGame();
  const [selectedTarget, setSelectedTarget] = useState('');
  const [attackForce, setAttackForce] = useState({
    soldiers: 0,
    tanks: 0,
    aircraft: 0,
    missiles: 0,
    submarines: 0,
    ships: 0
  });
  const [reinforcementForce, setReinforcementForce] = useState({
    soldiers: 0,
    tanks: 0,
    aircraft: 0,
    missiles: 0,
    submarines: 0,
    ships: 0
  });
  const [selectedWar, setSelectedWar] = useState('');
  const [activeTab, setActiveTab] = useState<'declare' | 'reinforce' | 'statistics'>('declare');

  if (!state.currentUser?.country) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <p className="text-white" dir="rtl">ابتدا کشور خود را انتخاب کنید</p>
      </div>
    );
  }

  // Check if user has shield protection
  const hasShieldProtection = () => {
    if (!state.currentUser?.countrySelectedAt) return false;
    const timeSinceSelection = Date.now() - new Date(state.currentUser.countrySelectedAt).getTime();
    return timeSinceSelection < state.gameSettings.shieldProtectionTime;
  };

  const availableTargets = state.users.filter(u => 
    u.role === 'player' && 
    u.country && 
    u.id !== state.currentUser?.id &&
    !state.wars.some(w => 
      (w.aggressor === state.currentUser?.id && w.defender === u.id) ||
      (w.aggressor === u.id && w.defender === state.currentUser?.id) &&
      w.status === 'active'
    )
  );

  const myWars = state.wars.filter(w => 
    (w.aggressor === state.currentUser?.id || w.defender === state.currentUser?.id) &&
    w.status === 'active'
  );

  const calculateBattleResult = (attackForce: any, defenderResources: any, defenderDefense: number): BattleStatistics => {
    // Air battle calculations
    const totalAirAttack = attackForce.aircraft + attackForce.missiles;
    const defenseEffectiveness = Math.min(defenderDefense * 0.1, 0.8); // Max 80% effectiveness
    const aircraftDestroyed = Math.floor(attackForce.aircraft * defenseEffectiveness * Math.random());
    const missilesDestroyed = Math.floor(attackForce.missiles * defenseEffectiveness * Math.random());
    const totalAirAttacksBlocked = aircraftDestroyed + missilesDestroyed;

    // Naval battle calculations
    const attackerNavalPower = attackForce.ships + attackForce.submarines;
    const defenderNavalPower = defenderResources.ships + defenderResources.submarines;
    const navalRatio = attackerNavalPower / Math.max(defenderNavalPower, 1);
    
    const attackerShipsLost = Math.floor(attackForce.ships * (1 / Math.max(navalRatio, 0.5)) * Math.random() * 0.3);
    const attackerSubmarinesLost = Math.floor(attackForce.submarines * (1 / Math.max(navalRatio, 0.5)) * Math.random() * 0.2);
    const defenderShipsLost = Math.floor(defenderResources.ships * navalRatio * Math.random() * 0.4);
    const defenderSubmarinesLost = Math.floor(defenderResources.submarines * navalRatio * Math.random() * 0.3);

    // Ground battle calculations
    const attackerGroundPower = attackForce.tanks + attackForce.soldiers;
    const defenderGroundPower = defenderResources.tanks + defenderResources.soldiers;
    const groundRatio = attackerGroundPower / Math.max(defenderGroundPower, 1);
    
    const attackerTanksLost = Math.floor(attackForce.tanks * (1 / Math.max(groundRatio, 0.5)) * Math.random() * 0.25);
    const attackerSoldiersLost = Math.floor(attackForce.soldiers * (1 / Math.max(groundRatio, 0.5)) * Math.random() * 0.2);
    const defenderTanksLost = Math.floor(defenderResources.tanks * groundRatio * Math.random() * 0.35);
    const defenderSoldiersLost = Math.floor(defenderResources.soldiers * groundRatio * Math.random() * 0.3);

    // Defense system damage
    const defenseSystemDamage = Math.floor(defenderDefense * 0.1 * Math.random());

    // Calculate total damage and winner
    const attackerTotalPower = attackForce.soldiers + attackForce.tanks * 10 + attackForce.aircraft * 20 + 
                              attackForce.missiles * 50 + attackForce.submarines * 40 + attackForce.ships * 30;
    const defenderTotalPower = defenderResources.soldiers + defenderResources.tanks * 10 + 
                              defenderResources.aircraft * 20 + defenderResources.missiles * 50 + 
                              defenderResources.submarines * 40 + defenderResources.ships * 30 + 
                              defenderDefense * 15;

    const damageDealt = Math.floor((attackerTotalPower / Math.max(defenderTotalPower, 1)) * 100);
    const damageReceived = Math.floor((defenderTotalPower / Math.max(attackerTotalPower, 1)) * 100);

    let winner: 'attacker' | 'defender' | 'draw' = 'draw';
    if (damageDealt > damageReceived * 1.2) winner = 'attacker';
    else if (damageReceived > damageDealt * 1.2) winner = 'defender';

    return {
      attackerLosses: {
        soldiers: attackerSoldiersLost,
        tanks: attackerTanksLost,
        aircraft: aircraftDestroyed,
        missiles: missilesDestroyed,
        submarines: attackerSubmarinesLost,
        ships: attackerShipsLost
      },
      defenderLosses: {
        soldiers: defenderSoldiersLost,
        tanks: defenderTanksLost,
        aircraft: 0,
        missiles: 0,
        submarines: defenderSubmarinesLost,
        ships: defenderShipsLost,
        defense: defenseSystemDamage
      },
      defenseEffectiveness: {
        aircraftDestroyed,
        missilesDestroyed,
        totalAirAttacksBlocked
      },
      navalBattle: {
        attackerShipsLost,
        attackerSubmarinesLost,
        defenderShipsLost,
        defenderSubmarinesLost
      },
      groundBattle: {
        attackerTanksLost,
        attackerSoldiersLost,
        defenderTanksLost,
        defenderSoldiersLost
      },
      winner,
      damageDealt,
      damageReceived
    };
  };

  const handleDeclareWar = () => {
    if (!selectedTarget || hasShieldProtection()) {
      alert('شما در حال حاضر نمی‌توانید جنگ اعلام کنید');
      return;
    }

    const totalForce = attackForce.soldiers + attackForce.tanks + attackForce.aircraft + 
                      attackForce.missiles + attackForce.submarines + attackForce.ships;

    if (totalForce <= 0) {
      alert('حداقل باید یک نیرو برای حمله انتخاب کنید');
      return;
    }

    if (attackForce.soldiers > state.currentUser!.resources.soldiers ||
        attackForce.tanks > state.currentUser!.resources.tanks ||
        attackForce.aircraft > state.currentUser!.resources.aircraft ||
        attackForce.missiles > state.currentUser!.resources.missiles ||
        attackForce.submarines > state.currentUser!.resources.submarines ||
        attackForce.ships > state.currentUser!.resources.ships) {
      alert('نیروی انتخابی بیش از منابع موجود است');
      return;
    }

    const target = state.users.find(u => u.id === selectedTarget);
    if (!target) return;

    // Show immediate attack notification to defender
    const attackNotification = {
      id: Date.now().toString(),
      userId: selectedTarget,
      type: 'battle' as const,
      title: '🚨 مورد حمله قرار گرفتید!',
      message: `شما توسط ${state.currentUser!.username} مورد حمله قرار گرفتید!\n\n` +
               `نیروی حمله کننده:\n` +
               `🪖 ${attackForce.soldiers.toLocaleString()} سرباز\n` +
               `🚛 ${attackForce.tanks.toLocaleString()} تانک\n` +
               `✈️ ${attackForce.aircraft.toLocaleString()} هواپیما\n` +
               `🚀 ${attackForce.missiles.toLocaleString()} موشک\n` +
               `🚤 ${attackForce.submarines.toLocaleString()} زیردریایی\n` +
               `🚢 ${attackForce.ships.toLocaleString()} کشتی جنگی\n\n` +
               `نتیجه جنگ تا 20 ثانیه دیگر اعلام خواهد شد...`,
      isRead: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30000) // 30 seconds
    };

    dispatch({ type: 'CREATE_NOTIFICATION', payload: attackNotification });

    const war: War = {
      id: Date.now().toString(),
      aggressor: state.currentUser!.id,
      defender: selectedTarget,
      status: 'active',
      startTime: new Date(),
      attackForce,
      reinforcements: []
    };

    dispatch({ type: 'DECLARE_WAR', payload: war });

    // Calculate battle result after 20 seconds
    setTimeout(() => {
      const defender = state.users.find(u => u.id === selectedTarget);
      if (!defender) return;

      const defenderDefense = defender.resources.defense || 0;
      const battleStats = calculateBattleResult(attackForce, defender.resources, defenderDefense);

      // Update war with battle statistics
      dispatch({ type: 'UPDATE_WAR_STATISTICS', payload: { warId: war.id, statistics: battleStats } });

      // Apply losses to both sides
      dispatch({ type: 'APPLY_BATTLE_LOSSES', payload: {
        attackerId: state.currentUser!.id,
        defenderId: selectedTarget,
        losses: battleStats
      }});

      // Create detailed battle result notifications
      const attackerNotification = {
        id: (Date.now() + 1).toString(),
        userId: state.currentUser!.id,
        type: 'battle' as const,
        title: '⚔️ نتیجه حمله شما',
        message: `📊 گزارش کامل حمله شما به ${defender.username}:\n\n` +
                `🏆 نتیجه نهایی: ${battleStats.winner === 'attacker' ? '🎉 پیروز شدید!' : 
                  battleStats.winner === 'defender' ? '😞 شکست خوردید!' : '🤝 نبرد مساوی!'}\n\n` +
                
                `💥 خسارات وارد شده:\n` +
                `• خسارت کلی به دشمن: ${battleStats.damageDealt}%\n` +
                `• خسارت دریافتی: ${battleStats.damageReceived}%\n\n` +
                
                `✈️ نبرد هوایی:\n` +
                `• هواپیماهای از دست رفته: ${battleStats.attackerLosses.aircraft}\n` +
                `• موشک‌های از دست رفته: ${battleStats.attackerLosses.missiles}\n` +
                `• پدافند دشمن ${battleStats.defenseEffectiveness.totalAirAttacksBlocked} حمله هوایی را دفع کرد\n\n` +
                
                `🚢 نبرد دریایی:\n` +
                `• کشتی‌های از دست رفته: ${battleStats.navalBattle.attackerShipsLost}\n` +
                `• زیردریایی‌های از دست رفته: ${battleStats.navalBattle.attackerSubmarinesLost}\n` +
                `• کشتی‌های دشمن منهدم شده: ${battleStats.navalBattle.defenderShipsLost}\n` +
                `• زیردریایی‌های دشمن منهدم شده: ${battleStats.navalBattle.defenderSubmarinesLost}\n\n` +
                
                `🚛 نبرد زمینی:\n` +
                `• تانک‌های از دست رفته: ${battleStats.groundBattle.attackerTanksLost}\n` +
                `• سربازان کشته شده: ${battleStats.groundBattle.attackerSoldiersLost}\n` +
                `• تانک‌های دشمن منهدم شده: ${battleStats.groundBattle.defenderTanksLost}\n` +
                `• سربازان دشمن کشته شده: ${battleStats.groundBattle.defenderSoldiersLost}`,
        isRead: false,
        createdAt: new Date(),
        data: battleStats
      };

      const defenderNotification = {
        id: (Date.now() + 2).toString(),
        userId: selectedTarget,
        type: 'battle' as const,
        title: '⚔️ نتیجه دفاع شما',
        message: `📊 گزارش کامل دفاع شما از حمله ${state.currentUser!.username}:\n\n` +
                `🏆 نتیجه نهایی: ${battleStats.winner === 'defender' ? '🎉 دفاع موفق!' : 
                  battleStats.winner === 'attacker' ? '😞 شکست در دفاع!' : '🤝 نبرد مساوی!'}\n\n` +
                
                `💥 خسارات دریافتی:\n` +
                `• خسارت کلی دریافتی: ${battleStats.damageReceived}%\n` +
                `• خسارت وارد شده به مهاجم: ${battleStats.damageDealt}%\n\n` +
                
                `🛡️ عملکرد پدافند:\n` +
                `• هواپیماهای دشمن منهدم شده: ${battleStats.defenseEffectiveness.aircraftDestroyed}\n` +
                `• موشک‌های دشمن منهدم شده: ${battleStats.defenseEffectiveness.missilesDestroyed}\n` +
                `• کل حملات هوایی دفع شده: ${battleStats.defenseEffectiveness.totalAirAttacksBlocked}\n` +
                `• آسیب به سیستم پدافند: ${battleStats.defenderLosses.defense}\n\n` +
                
                `🚢 نبرد دریایی:\n` +
                `• کشتی‌های از دست رفته: ${battleStats.navalBattle.defenderShipsLost}\n` +
                `• زیردریایی‌های از دست رفته: ${battleStats.navalBattle.defenderSubmarinesLost}\n` +
                `• کشتی‌های دشمن منهدم شده: ${battleStats.navalBattle.attackerShipsLost}\n` +
                `• زیردریایی‌های دشمن منهدم شده: ${battleStats.navalBattle.attackerSubmarinesLost}\n\n` +
                
                `🚛 نبرد زمینی:\n` +
                `• تانک‌های از دست رفته: ${battleStats.groundBattle.defenderTanksLost}\n` +
                `• سربازان کشته شده: ${battleStats.groundBattle.defenderSoldiersLost}\n` +
                `• تانک‌های دشمن منهدم شده: ${battleStats.groundBattle.attackerTanksLost}\n` +
                `• سربازان دشمن کشته شده: ${battleStats.groundBattle.attackerSoldiersLost}`,
        isRead: false,
        createdAt: new Date(),
        data: battleStats
      };

      dispatch({ type: 'CREATE_NOTIFICATION', payload: attackerNotification });
      dispatch({ type: 'CREATE_NOTIFICATION', payload: defenderNotification });

    }, 20000); // 20 seconds delay

    // Reset form
    setSelectedTarget('');
    setAttackForce({ soldiers: 0, tanks: 0, aircraft: 0, missiles: 0, submarines: 0, ships: 0 });
    
    alert(`جنگ علیه ${target.username} اعلام شد! نتیجه تا 20 ثانیه دیگر اعلام خواهد شد.`);
  };

  const handleSendReinforcement = () => {
    if (!selectedWar) {
      alert('لطفاً جنگ مورد نظر را انتخاب کنید');
      return;
    }

    const totalReinforcement = reinforcementForce.soldiers + reinforcementForce.tanks + 
                              reinforcementForce.aircraft + reinforcementForce.missiles + 
                              reinforcementForce.submarines + reinforcementForce.ships;

    if (totalReinforcement <= 0) {
      alert('حداقل باید یک نیرو برای تقویت انتخاب کنید');
      return;
    }

    if (reinforcementForce.soldiers > state.currentUser!.resources.soldiers ||
        reinforcementForce.tanks > state.currentUser!.resources.tanks ||
        reinforcementForce.aircraft > state.currentUser!.resources.aircraft ||
        reinforcementForce.missiles > state.currentUser!.resources.missiles ||
        reinforcementForce.submarines > state.currentUser!.resources.submarines ||
        reinforcementForce.ships > state.currentUser!.resources.ships) {
      alert('نیروی انتخابی بیش از منابع موجود است');
      return;
    }

    const reinforcement: WarReinforcement = {
      id: Date.now().toString(),
      warId: selectedWar,
      sender: state.currentUser!.id,
      senderName: state.currentUser!.username,
      force: reinforcementForce,
      timestamp: new Date()
    };

    dispatch({ type: 'SEND_WAR_REINFORCEMENT', payload: reinforcement });
    
    // Reset form
    setReinforcementForce({ soldiers: 0, tanks: 0, aircraft: 0, missiles: 0, submarines: 0, ships: 0 });
    setSelectedWar('');
    
    alert('تقویت ارسال شد!');
  };

  const handleRetreat = (warId: string) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید عقب‌نشینی کنید؟')) {
      dispatch({ type: 'RETREAT_FROM_WAR', payload: { warId } });
      alert('عقب‌نشینی انجام شد');
    }
  };

  const renderStatisticsTab = () => {
    const myWarHistory = state.wars.filter(w => 
      (w.aggressor === state.currentUser?.id || w.defender === state.currentUser?.id) &&
      w.battleStatistics
    ).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-2" dir="rtl">آمار جنگ‌ها</h3>
          <p className="text-gray-300" dir="rtl">تاریخچه و آمار کامل جنگ‌های شما</p>
        </div>

        {myWarHistory.length === 0 ? (
          <div className="text-center text-gray-400 py-8" dir="rtl">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>هنوز در جنگی شرکت نکرده‌اید</p>
          </div>
        ) : (
          <div className="space-y-6">
            {myWarHistory.map((war) => {
              const isAggressor = war.aggressor === state.currentUser?.id;
              const opponent = state.users.find(u => u.id === (isAggressor ? war.defender : war.aggressor));
              const opponentCountry = opponent?.country ? state.countries.find(c => c.id === opponent.country) : null;
              const stats = war.battleStatistics!;
              
              return (
                <div key={war.id} className="bg-white/10 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-6" dir="rtl">
                    <div className="flex items-center space-x-3">
                      {opponentCountry && <span className="text-3xl">{opponentCountry.flag}</span>}
                      <div>
                        <div className="font-bold text-white text-xl">
                          {isAggressor ? 'حمله به' : 'دفاع از'} {opponent?.username}
                        </div>
                        <div className="text-sm text-gray-300">
                          {new Date(war.startTime).toLocaleString('fa-IR')}
                        </div>
                      </div>
                    </div>
                    
                    <div className={`px-6 py-3 rounded-lg font-bold text-lg ${
                      stats.winner === (isAggressor ? 'attacker' : 'defender') 
                        ? 'bg-green-600 text-white' 
                        : stats.winner === 'draw'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}>
                      {stats.winner === (isAggressor ? 'attacker' : 'defender') ? '🎉 پیروزی' :
                       stats.winner === 'draw' ? '🤝 مساوی' : '😞 شکست'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Battle Overview */}
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="font-bold text-white mb-3 text-lg" dir="rtl">📊 خلاصه نبرد</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center" dir="rtl">
                          <span className="text-gray-300">خسارت وارده:</span>
                          <span className="text-green-400 font-bold text-lg">
                            {isAggressor ? stats.damageDealt : stats.damageReceived}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center" dir="rtl">
                          <span className="text-gray-300">خسارت دریافتی:</span>
                          <span className="text-red-400 font-bold text-lg">
                            {isAggressor ? stats.damageReceived : stats.damageDealt}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Defense Statistics */}
                    <div className="bg-blue-600/20 rounded-lg p-4">
                      <h4 className="font-bold text-blue-400 mb-3 text-lg" dir="rtl">🛡️ عملکرد پدافند</h4>
                      <div className="space-y-2 text-sm text-white">
                        <div className="flex justify-between" dir="rtl">
                          <span>هواپیماهای منهدم شده:</span>
                          <span className="font-bold">{stats.defenseEffectiveness.aircraftDestroyed}</span>
                        </div>
                        <div className="flex justify-between" dir="rtl">
                          <span>موشک‌های منهدم شده:</span>
                          <span className="font-bold">{stats.defenseEffectiveness.missilesDestroyed}</span>
                        </div>
                        <div className="flex justify-between" dir="rtl">
                          <span>کل حملات دفع شده:</span>
                          <span className="font-bold text-green-400">{stats.defenseEffectiveness.totalAirAttacksBlocked}</span>
                        </div>
                      </div>
                    </div>

                    {/* Naval Battle */}
                    <div className="bg-cyan-600/20 rounded-lg p-4">
                      <h4 className="font-bold text-cyan-400 mb-3 text-lg" dir="rtl">🚢 نبرد دریایی</h4>
                      <div className="space-y-2 text-sm text-white">
                        <div className="font-medium text-cyan-300 mb-2">تلفات شما:</div>
                        <div className="flex justify-between" dir="rtl">
                          <span>کشتی‌های از دست رفته:</span>
                          <span className="font-bold text-red-400">
                            {isAggressor ? stats.navalBattle.attackerShipsLost : stats.navalBattle.defenderShipsLost}
                          </span>
                        </div>
                        <div className="flex justify-between" dir="rtl">
                          <span>زیردریایی‌های از دست رفته:</span>
                          <span className="font-bold text-red-400">
                            {isAggressor ? stats.navalBattle.attackerSubmarinesLost : stats.navalBattle.defenderSubmarinesLost}
                          </span>
                        </div>
                        <div className="font-medium text-cyan-300 mb-2 mt-3">تلفات دشمن:</div>
                        <div className="flex justify-between" dir="rtl">
                          <span>کشتی‌های منهدم شده:</span>
                          <span className="font-bold text-green-400">
                            {isAggressor ? stats.navalBattle.defenderShipsLost : stats.navalBattle.attackerShipsLost}
                          </span>
                        </div>
                        <div className="flex justify-between" dir="rtl">
                          <span>زیردریایی‌های منهدم شده:</span>
                          <span className="font-bold text-green-400">
                            {isAggressor ? stats.navalBattle.defenderSubmarinesLost : stats.navalBattle.attackerSubmarinesLost}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ground Battle */}
                    <div className="bg-orange-600/20 rounded-lg p-4">
                      <h4 className="font-bold text-orange-400 mb-3 text-lg" dir="rtl">🚛 نبرد زمینی</h4>
                      <div className="space-y-2 text-sm text-white">
                        <div className="font-medium text-orange-300 mb-2">تلفات شما:</div>
                        <div className="flex justify-between" dir="rtl">
                          <span>تانک‌های از دست رفته:</span>
                          <span className="font-bold text-red-400">
                            {isAggressor ? stats.groundBattle.attackerTanksLost : stats.groundBattle.defenderTanksLost}
                          </span>
                        </div>
                        <div className="flex justify-between" dir="rtl">
                          <span>سربازان کشته شده:</span>
                          <span className="font-bold text-red-400">
                            {isAggressor ? stats.groundBattle.attackerSoldiersLost : stats.groundBattle.defenderSoldiersLost}
                          </span>
                        </div>
                        <div className="font-medium text-orange-300 mb-2 mt-3">تلفات دشمن:</div>
                        <div className="flex justify-between" dir="rtl">
                          <span>تانک‌های منهدم شده:</span>
                          <span className="font-bold text-green-400">
                            {isAggressor ? stats.groundBattle.defenderTanksLost : stats.groundBattle.attackerTanksLost}
                          </span>
                        </div>
                        <div className="flex justify-between" dir="rtl">
                          <span>سربازان کشته شده:</span>
                          <span className="font-bold text-green-400">
                            {isAggressor ? stats.groundBattle.defenderSoldiersLost : stats.groundBattle.attackerSoldiersLost}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2" dir="rtl">مدیریت جنگ</h3>
        <p className="text-gray-300" dir="rtl">اعلام جنگ، ارسال تقویت و مشاهده آمار کامل</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/10 rounded-lg p-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('declare')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'declare'
                ? 'bg-red-600 text-white'
                : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>اعلام جنگ</span>
          </button>
          <button
            onClick={() => setActiveTab('reinforce')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'reinforce'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>ارسال تقویت</span>
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'statistics'
                ? 'bg-green-600 text-white'
                : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>آمار جنگ‌ها</span>
          </button>
        </div>
      </div>

      {hasShieldProtection() && activeTab === 'declare' && (
        <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2" dir="rtl">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-bold">محافظت فعال</span>
          </div>
          <p className="text-blue-300 text-sm" dir="rtl">
            شما در حال حاضر تحت محافظت هستید و نمی‌توانید جنگ اعلام کنید
          </p>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'declare' && (
        <div className="space-y-6">
          {/* My Wars */}
          {myWars.length > 0 && (
            <div className="bg-red-600/20 rounded-lg p-6">
              <h4 className="text-xl font-bold text-white mb-4 flex items-center space-x-2" dir="rtl">
                <Swords className="w-6 h-6" />
                <span>جنگ‌های فعال</span>
              </h4>
              
              <div className="space-y-3">
                {myWars.map((war) => {
                  const isAggressor = war.aggressor === state.currentUser?.id;
                  const opponent = state.users.find(u => u.id === (isAggressor ? war.defender : war.aggressor));
                  const opponentCountry = opponent?.country ? state.countries.find(c => c.id === opponent.country) : null;
                  
                  return (
                    <div key={war.id} className="bg-white/10 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3" dir="rtl">
                        <div className="flex items-center space-x-3">
                          {opponentCountry && <span className="text-2xl">{opponentCountry.flag}</span>}
                          <div>
                            <div className="font-bold text-white">
                              {isAggressor ? 'حمله به' : 'دفاع از'} {opponent?.username}
                            </div>
                            <div className="text-sm text-gray-300">
                              شروع: {new Date(war.startTime).toLocaleString('fa-IR')}
                            </div>
                          </div>
                        </div>
                        
                        {isAggressor && (
                          <button
                            onClick={() => handleRetreat(war.id)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition-colors"
                          >
                            عقب‌نشینی
                          </button>
                        )}
                      </div>

                      {/* Show reinforcements */}
                      {war.reinforcements && war.reinforcements.length > 0 && (
                        <div className="mt-3 bg-white/5 rounded-lg p-3">
                          <h5 className="font-bold text-white mb-2" dir="rtl">تقویت‌های ارسالی:</h5>
                          <div className="space-y-1 text-sm">
                            {war.reinforcements.map((reinforcement) => (
                              <div key={reinforcement.id} className="text-gray-300" dir="rtl">
                                {reinforcement.senderName}: {reinforcement.force.soldiers} سرباز، {reinforcement.force.tanks} تانک، {reinforcement.force.aircraft} هواپیما، {reinforcement.force.missiles} موشک، {reinforcement.force.submarines} زیردریایی، {reinforcement.force.ships} کشتی
                                <span className="text-xs text-gray-400 mr-2">
                                  ({new Date(reinforcement.timestamp).toLocaleTimeString('fa-IR')})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Declare War */}
          {!hasShieldProtection() && (
            <div className="bg-white/10 rounded-lg p-6">
              <h4 className="text-xl font-bold text-white mb-4" dir="rtl">اعلام جنگ جدید</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                    انتخاب هدف:
                  </label>
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    dir="rtl"
                  >
                    <option value="">کشور مورد نظر را انتخاب کنید</option>
                    {availableTargets.map(user => {
                      const userCountry = user.country ? state.countries.find(c => c.id === user.country) : null;
                      return (
                        <option key={user.id} value={user.id}>
                          {userCountry?.flag} {user.username} ({userCountry?.name})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                    نیروی حمله:
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1" dir="rtl">سربازان</label>
                      <input
                        type="number"
                        value={attackForce.soldiers}
                        onChange={(e) => setAttackForce(prev => ({ ...prev, soldiers: parseInt(e.target.value) || 0 }))}
                        max={state.currentUser?.resources.soldiers}
                        min="0"
                        className="w-full bg-white/10 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        dir="rtl"
                      />
                      <div className="text-xs text-gray-400 mt-1" dir="rtl">
                        موجود: {state.currentUser?.resources.soldiers.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-1" dir="rtl">تانک‌ها</label>
                      <input
                        type="number"
                        value={attackForce.tanks}
                        onChange={(e) => setAttackForce(prev => ({ ...prev, tanks: parseInt(e.target.value) || 0 }))}
                        max={state.currentUser?.resources.tanks}
                        min="0"
                        className="w-full bg-white/10 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        dir="rtl"
                      />
                      <div className="text-xs text-gray-400 mt-1" dir="rtl">
                        موجود: {state.currentUser?.resources.tanks.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-1" dir="rtl">هواپیماها</label>
                      <input
                        type="number"
                        value={attackForce.aircraft}
                        onChange={(e) => setAttackForce(prev => ({ ...prev, aircraft: parseInt(e.target.value) || 0 }))}
                        max={state.currentUser?.resources.aircraft}
                        min="0"
                        className="w-full bg-white/10 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        dir="rtl"
                      />
                      <div className="text-xs text-gray-400 mt-1" dir="rtl">
                        موجود: {state.currentUser?.resources.aircraft.toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1" dir="rtl">موشک‌ها</label>
                      <input
                        type="number"
                        value={attackForce.missiles}
                        onChange={(e) => setAttackForce(prev => ({ ...prev, missiles: parseInt(e.target.value) || 0 }))}
                        max={state.currentUser?.resources.missiles}
                        min="0"
                        className="w-full bg-white/10 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        dir="rtl"
                      />
                      <div className="text-xs text-gray-400 mt-1" dir="rtl">
                        موجود: {state.currentUser?.resources.missiles.toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1" dir="rtl">زیردریایی‌ها</label>
                      <input
                        type="number"
                        value={attackForce.submarines}
                        onChange={(e) => setAttackForce(prev => ({ ...prev, submarines: parseInt(e.target.value) || 0 }))}
                        max={state.currentUser?.resources.submarines}
                        min="0"
                        className="w-full bg-white/10 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        dir="rtl"
                      />
                      <div className="text-xs text-gray-400 mt-1" dir="rtl">
                        موجود: {state.currentUser?.resources.submarines.toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1" dir="rtl">کشتی‌ها</label>
                      <input
                        type="number"
                        value={attackForce.ships}
                        onChange={(e) => setAttackForce(prev => ({ ...prev, ships: parseInt(e.target.value) || 0 }))}
                        max={state.currentUser?.resources.ships}
                        min="0"
                        className="w-full bg-white/10 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        dir="rtl"
                      />
                      <div className="text-xs text-gray-400 mt-1" dir="rtl">
                        موجود: {state.currentUser?.resources.ships.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDeclareWar}
                  disabled={!selectedTarget || hasShieldProtection()}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  اعلام جنگ
                </button>
              </div>
            </div>
          )}

          {availableTargets.length === 0 && !hasShieldProtection() && (
            <div className="text-center text-gray-400 py-8" dir="rtl">
              <Swords className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>هدف مناسبی برای جنگ وجود ندارد</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reinforce' && (
        <div className="space-y-6">
          {/* Send Reinforcement */}
          {myWars.length > 0 ? (
            <div className="bg-blue-600/20 rounded-lg p-6">
              <h4 className="text-xl font-bold text-white mb-4 flex items-center space-x-2" dir="rtl">
                <Plus className="w-6 h-6" />
                <span>ارسال تقویت</span>
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                    انتخاب جنگ:
                  </label>
                  <select
                    value={selectedWar}
                    onChange={(e) => setSelectedWar(e.target.value)}
                    className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    dir="rtl"
                  >
                    <option value="">جنگ مورد نظر را انتخاب کنید</option>
                    {myWars.map(war => {
                      const isAggressor = war.aggressor === state.currentUser?.id;
                      const opponent = state.users.find(u => u.id === (isAggressor ? war.defender : war.aggressor));
                      const opponentCountry = opponent?.country ? state.countries.find(c => c.id === opponent.country) : null;
                      
                      return (
                        <option key={war.id} value={war.id}>
                          جنگ با {opponent?.username} ({opponentCountry?.name})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                    نیروی تقویت:
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1" dir="rtl">سربازان</label>
                      <input
                        type="number"
                        value={reinforcementForce.soldiers}
                        onChange={(e) => setReinforcementForce(prev => ({ ...prev, soldiers: parseInt(e.target.value) || 0 }))}
                        max={state.currentUser?.resources.soldiers}
                        min="0"
                        className="w-full bg-white/10 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        dir="rtl"
                      />
                      <div className="text-xs text-gray-400 mt-1" dir="rtl">
                        موجود: {state.currentUser?.resources.soldiers.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-1" dir="rtl">تانک‌ها</label>
                      <input
                        type="number"
                        value={reinforcementForce.tanks}
                        onChange={(e) => setReinforcementForce(prev => ({ ...prev, tanks: parseInt(e.target.value) || 0 }))}
                        max={state.currentUser?.resources.tanks}
                        min="0"
                        className="w-full bg-white/10 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        dir="rtl"
                      />
                      <div className="text-xs text-gray-400 mt-1" dir="rtl">
                        موجود: {state.currentUser?.resources.tanks.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-1" dir="rtl">هواپیماها</label>
                      <input
                        type="number"
                        value={reinforcementForce.aircraft}
                        onChange={(e) => setReinforcementForce(prev => ({ ...prev, aircraft: parseInt(e.target.value) || 0 }))}
                        max={state.currentUser?.resources.aircraft}
                        min="0"
                        className="w-full bg-white/10 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        dir="rtl"
                      />
                      <div className="text-xs text-gray-400 mt-1" dir="rtl">
                        موجود: {state.currentUser?.resources.aircraft.toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1" dir="rtl">موشک‌ها</label>
                      <input
                        type="number"
                        value={reinforcementForce.missiles}
                        onChange={(e) => setReinforcementForce(prev => ({ ...prev, missiles: parseInt(e.target.value) || 0 }))}
                        max={state.currentUser?.resources.missiles}
                        min="0"
                        className="w-full bg-white/10 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        dir="rtl"
                      />
                      <div className="text-xs text-gray-400 mt-1" dir="rtl">
                        موجود: {state.currentUser?.resources.missiles.toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1" dir="rtl">زیردریایی‌ها</label>
                      <input
                        type="number"
                        value={reinforcementForce.submarines}
                        onChange={(e) => setReinforcementForce(prev => ({ ...prev, submarines: parseInt(e.target.value) || 0 }))}
                        max={state.currentUser?.resources.submarines}
                        min="0"
                        className="w-full bg-white/10 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        dir="rtl"
                      />
                      <div className="text-xs text-gray-400 mt-1" dir="rtl">
                        موجود: {state.currentUser?.resources.submarines.toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1" dir="rtl">کشتی‌ها</label>
                      <input
                        type="number"
                        value={reinforcementForce.ships}
                        onChange={(e) => setReinforcementForce(prev => ({ ...prev, ships: parseInt(e.target.value) || 0 }))}
                        max={state.currentUser?.resources.ships}
                        min="0"
                        className="w-full bg-white/10 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        dir="rtl"
                      />
                      <div className="text-xs text-gray-400 mt-1" dir="rtl">
                        موجود: {state.currentUser?.resources.ships.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSendReinforcement}
                  disabled={!selectedWar}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>ارسال تقویت</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8" dir="rtl">
              <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>شما در حال حاضر درگیر جنگی نیستید</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'statistics' && renderStatisticsTab()}
    </div>
  );
};

export default WarDeclaration;