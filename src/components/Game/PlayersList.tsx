import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { Crown, Shield, Swords, Users, Trophy } from 'lucide-react';
import { PlayerRanking } from '../../types';

const PlayersList: React.FC = () => {
  const { state } = useGame();

  const activePlayers = state.users.filter(u => u.role === 'player');

  // Calculate player rankings
  const playerRankings: PlayerRanking[] = activePlayers.map(player => {
    const totalPower = player.resources.soldiers + 
                      player.resources.weapons + 
                      player.resources.tanks * 10 + 
                      player.resources.aircraft * 20 + 
                      player.resources.missiles * 50 + 
                      player.resources.submarines * 40 + 
                      player.resources.ships * 30 + 
                      Math.floor(player.money / 100);

    return {
      userId: player.id,
      username: player.username,
      country: player.country,
      totalPower,
      rank: 0 // Will be set after sorting
    };
  }).sort((a, b) => b.totalPower - a.totalPower)
    .map((player, index) => ({ ...player, rank: index + 1 }));

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-300';
      case 3: return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2" dir="rtl">
        <Trophy className="w-6 h-6" />
        <span>رتبه‌بندی بازیکنان ({activePlayers.length})</span>
      </h2>

      <div className="space-y-3">
        {playerRankings.map((ranking) => {
          const player = activePlayers.find(p => p.id === ranking.userId);
          const playerCountry = ranking.country ? state.countries.find(c => c.id === ranking.country) : null;
          const isCurrentUser = ranking.userId === state.currentUser?.id;
          
          return (
            <div
              key={ranking.userId}
              className={`bg-white/10 rounded-lg p-3 border ${
                isCurrentUser ? 'border-green-500 bg-green-500/20' : 'border-transparent'
              }`}
            >
              <div className="flex items-center justify-between" dir="rtl">
                <div className="flex items-center space-x-3">
                  <div className={`text-lg font-bold ${getRankColor(ranking.rank)} min-w-[2rem] text-center`}>
                    {getRankIcon(ranking.rank)}
                  </div>
                  
                  {playerCountry && (
                    <span className="text-xl">{playerCountry.flag}</span>
                  )}
                  
                  <div>
                    <div className="font-bold text-white text-sm">
                      {ranking.username}
                      {isCurrentUser && (
                        <span className="text-green-400 mr-1">(شما)</span>
                      )}
                    </div>
                    {playerCountry && (
                      <div className="text-xs text-gray-300">{playerCountry.name}</div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Crown className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-yellow-400 font-bold">
                      {ranking.totalPower.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">قدرت کل</div>
                </div>
              </div>

              {!playerCountry && (
                <div className="text-xs text-gray-400 mt-1" dir="rtl">
                  در انتظار انتخاب کشور...
                </div>
              )}

              {/* Show additional info for current user */}
              {isCurrentUser && player && (
                <div className="mt-2 pt-2 border-t border-gray-600">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-blue-400 font-bold">{player.resources.soldiers.toLocaleString()}</div>
                      <div className="text-gray-400">سرباز</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-400 font-bold">{player.resources.weapons.toLocaleString()}</div>
                      <div className="text-gray-400">سلاح</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-400 font-bold">{player.money.toLocaleString()}</div>
                      <div className="text-gray-400">WD</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {activePlayers.length === 0 && (
          <div className="text-gray-400 text-center py-4" dir="rtl">
            هنوز بازیکنی وارد نشده است
          </div>
        )}
      </div>

      {/* Game Status */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <div className="text-xs text-gray-400 space-y-1" dir="rtl">
          <div>حداکثر بازیکنان: {state.gameSettings.maxPlayers}</div>
          <div>مدت فصل: {state.gameSettings.seasonDuration} روز</div>
          <div>کشورهای انتخاب شده: {state.countries.filter(c => c.isOccupied).length}</div>
          <div>درصد خرید ربات: {state.gameSettings.robotBuybackPercentage}%</div>
        </div>
      </div>
    </div>
  );
};

export default PlayersList;