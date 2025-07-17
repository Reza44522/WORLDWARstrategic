import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { Shield, Clock, MessageCircle, CheckCircle, X } from 'lucide-react';
import { PeaceProposal } from '../../types';

const PeaceProposals: React.FC = () => {
  const { state, dispatch } = useGame();
  const [selectedWar, setSelectedWar] = useState('');
  const [proposalType, setProposalType] = useState<'peace' | 'ceasefire'>('peace');
  const [duration, setDuration] = useState(24);
  const [terms, setTerms] = useState('');

  if (!state.currentUser?.country) {
    return (
      <div className="text-center py-8">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-white" dir="rtl">ابتدا کشور خود را انتخاب کنید</p>
      </div>
    );
  }

  const myWars = state.wars.filter(w => 
    (w.aggressor === state.currentUser?.id || w.defender === state.currentUser?.id) &&
    w.status === 'active'
  );

  const myProposals = state.peaceProposals.filter(p => 
    p.proposer === state.currentUser?.id || p.target === state.currentUser?.id
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleCreateProposal = () => {
    if (!selectedWar) {
      alert('لطفاً جنگ مورد نظر را انتخاب کنید');
      return;
    }

    const war = state.wars.find(w => w.id === selectedWar);
    if (!war) return;

    const targetId = war.aggressor === state.currentUser?.id ? war.defender : war.aggressor;
    const target = state.users.find(u => u.id === targetId);
    if (!target) return;

    const proposal: PeaceProposal = {
      id: Date.now().toString(),
      proposer: state.currentUser!.id,
      proposerName: state.currentUser!.username,
      target: targetId,
      targetName: target.username,
      type: proposalType,
      duration: proposalType === 'ceasefire' ? duration : undefined,
      terms: terms.trim() || undefined,
      status: 'pending',
      createdAt: new Date()
    };

    dispatch({ type: 'CREATE_PEACE_PROPOSAL', payload: proposal });
    
    // Reset form
    setSelectedWar('');
    setTerms('');
    setDuration(24);
    
    alert(`پیشنهاد ${proposalType === 'peace' ? 'صلح' : 'آتش‌بس'} ارسال شد`);
  };

  const handleRespondToProposal = (proposalId: string, accepted: boolean) => {
    dispatch({ 
      type: 'RESPOND_PEACE_PROPOSAL', 
      payload: { proposalId, accepted } 
    });
    
    alert(accepted ? 'پیشنهاد پذیرفته شد' : 'پیشنهاد رد شد');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2" dir="rtl">پیشنهادات صلح</h3>
        <p className="text-gray-300" dir="rtl">پیشنهاد صلح یا آتش‌بس ارسال کنید</p>
      </div>

      {/* Create Peace Proposal */}
      {myWars.length > 0 && (
        <div className="bg-white/10 rounded-lg p-6">
          <h4 className="text-xl font-bold text-white mb-4" dir="rtl">ارسال پیشنهاد جدید</h4>
          
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
                نوع پیشنهاد:
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setProposalType('peace')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    proposalType === 'peace'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                  }`}
                >
                  صلح دائمی
                </button>
                <button
                  onClick={() => setProposalType('ceasefire')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    proposalType === 'ceasefire'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                  }`}
                >
                  آتش‌بس موقت
                </button>
              </div>
            </div>

            {proposalType === 'ceasefire' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                  مدت آتش‌بس (ساعت):
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 24)}
                  min="1"
                  max="168"
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  dir="rtl"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                شرایط (اختیاری):
              </label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={3}
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white resize-none"
                placeholder="شرایط صلح یا آتش‌بس خود را بنویسید..."
                dir="rtl"
              />
            </div>

            <button
              onClick={handleCreateProposal}
              disabled={!selectedWar}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              ارسال پیشنهاد
            </button>
          </div>
        </div>
      )}

      {/* Peace Proposals List */}
      <div className="bg-white/10 rounded-lg p-6">
        <h4 className="text-xl font-bold text-white mb-4" dir="rtl">پیشنهادات صلح</h4>
        
        <div className="space-y-3">
          {myProposals.map((proposal) => {
            const isMyProposal = proposal.proposer === state.currentUser?.id;
            const otherUser = state.users.find(u => u.id === (isMyProposal ? proposal.target : proposal.proposer));
            const otherCountry = otherUser?.country ? state.countries.find(c => c.id === otherUser.country) : null;
            
            return (
              <div key={proposal.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2" dir="rtl">
                    {otherCountry && <span className="text-xl">{otherCountry.flag}</span>}
                    <div>
                      <div className="font-bold text-white">
                        {isMyProposal ? `پیشنهاد به ${otherUser?.username}` : `پیشنهاد از ${otherUser?.username}`}
                      </div>
                      <div className="text-sm text-gray-300">
                        {proposal.type === 'peace' ? 'صلح دائمی' : `آتش‌بس ${proposal.duration} ساعته`}
                      </div>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    proposal.status === 'pending' 
                      ? 'bg-yellow-600/20 text-yellow-400'
                      : proposal.status === 'accepted'
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-red-600/20 text-red-400'
                  }`}>
                    {proposal.status === 'pending' ? 'در انتظار' :
                     proposal.status === 'accepted' ? 'پذیرفته شده' : 'رد شده'}
                  </span>
                </div>
                
                {proposal.terms && (
                  <div className="text-sm text-gray-300 mb-2" dir="rtl">
                    شرایط: {proposal.terms}
                  </div>
                )}
                
                <div className="text-xs text-gray-400 mb-3">
                  {new Date(proposal.createdAt).toLocaleString('fa-IR')}
                </div>

                {!isMyProposal && proposal.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRespondToProposal(proposal.id, false)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors flex items-center justify-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>رد</span>
                    </button>
                    <button
                      onClick={() => handleRespondToProposal(proposal.id, true)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>پذیرش</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          
          {myProposals.length === 0 && (
            <div className="text-center text-gray-400 py-8" dir="rtl">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>هنوز پیشنهاد صلحی ارسال یا دریافت نکرده‌اید</p>
            </div>
          )}
        </div>
      </div>

      {myWars.length === 0 && (
        <div className="text-center text-gray-400 py-8" dir="rtl">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>شما در حال حاضر درگیر جنگی نیستید</p>
        </div>
      )}
    </div>
  );
};

export default PeaceProposals;