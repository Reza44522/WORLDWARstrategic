import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { Handshake, Users, Crown, Send, CheckCircle, X } from 'lucide-react';
import { Alliance, AllianceInvitation } from '../../types';

const AllianceManagement: React.FC = () => {
  const { state, dispatch } = useGame();
  const [allianceName, setAllianceName] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [invitationMessage, setInvitationMessage] = useState('');

  if (!state.currentUser?.country) {
    return (
      <div className="text-center py-8">
        <Handshake className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-white" dir="rtl">ابتدا کشور خود را انتخاب کنید</p>
      </div>
    );
  }

  const myAlliances = state.alliances.filter(a => a.members.includes(state.currentUser?.id || ''));
  
  const availablePlayers = state.users.filter(u => 
    u.role === 'player' && 
    u.country && 
    u.id !== state.currentUser?.id &&
    !myAlliances.some(a => a.members.includes(u.id)) &&
    !state.wars.some(w => 
      (w.aggressor === state.currentUser?.id && w.defender === u.id) ||
      (w.aggressor === u.id && w.defender === state.currentUser?.id) &&
      w.status === 'active'
    )
  );

  const myInvitations = state.allianceInvitations.filter(i => 
    i.sender === state.currentUser?.id || i.target === state.currentUser?.id
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSendInvitation = () => {
    if (!selectedPlayer || !allianceName.trim()) {
      alert('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    const target = state.users.find(u => u.id === selectedPlayer);
    if (!target) return;

    const invitation: AllianceInvitation = {
      id: Date.now().toString(),
      sender: state.currentUser!.id,
      senderName: state.currentUser!.username,
      target: selectedPlayer,
      targetName: target.username,
      allianceName: allianceName.trim(),
      message: invitationMessage.trim() || undefined,
      status: 'pending',
      createdAt: new Date()
    };

    dispatch({ type: 'CREATE_ALLIANCE_INVITATION', payload: invitation });
    
    // Reset form
    setSelectedPlayer('');
    setAllianceName('');
    setInvitationMessage('');
    
    alert(`دعوت اتحاد به ${target.username} ارسال شد`);
  };

  const handleRespondToInvitation = (invitationId: string, accepted: boolean) => {
    dispatch({ 
      type: 'RESPOND_ALLIANCE_INVITATION', 
      payload: { invitationId, accepted } 
    });
    
    alert(accepted ? 'دعوت اتحاد پذیرفته شد' : 'دعوت اتحاد رد شد');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2" dir="rtl">مدیریت اتحادها</h3>
        <p className="text-gray-300" dir="rtl">با سایر کشورها اتحاد تشکیل دهید</p>
      </div>

      {/* My Alliances */}
      {myAlliances.length > 0 && (
        <div className="bg-green-600/20 rounded-lg p-6">
          <h4 className="text-xl font-bold text-white mb-4 flex items-center space-x-2" dir="rtl">
            <Crown className="w-6 h-6" />
            <span>اتحادهای من</span>
          </h4>
          
          <div className="space-y-3">
            {myAlliances.map((alliance) => (
              <div key={alliance.id} className="bg-white/10 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3" dir="rtl">
                  <h5 className="font-bold text-white text-lg">{alliance.name}</h5>
                  <span className="text-sm text-gray-300">
                    {alliance.members.length} عضو
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {alliance.members.map(memberId => {
                    const member = state.users.find(u => u.id === memberId);
                    const memberCountry = member?.country ? state.countries.find(c => c.id === member.country) : null;
                    const isLeader = alliance.leader === memberId;
                    
                    return (
                      <div key={memberId} className="flex items-center space-x-2 bg-white/5 rounded p-2" dir="rtl">
                        {memberCountry && <span className="text-lg">{memberCountry.flag}</span>}
                        <div className="flex-1">
                          <div className="font-medium text-white">
                            {member?.username}
                            {isLeader && <span className="text-yellow-400 mr-1">(رهبر)</span>}
                          </div>
                          {memberCountry && (
                            <div className="text-xs text-gray-400">{memberCountry.name}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="text-xs text-gray-400 mt-3">
                  تشکیل شده: {new Date(alliance.createdAt).toLocaleDateString('fa-IR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Alliance */}
      {availablePlayers.length > 0 && (
        <div className="bg-white/10 rounded-lg p-6">
          <h4 className="text-xl font-bold text-white mb-4" dir="rtl">تشکیل اتحاد جدید</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                نام اتحاد:
              </label>
              <input
                type="text"
                value={allianceName}
                onChange={(e) => setAllianceName(e.target.value)}
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="نام اتحاد خود را وارد کنید"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                دعوت از بازیکن:
              </label>
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
                dir="rtl"
              >
                <option value="">بازیکن مورد نظر را انتخاب کنید</option>
                {availablePlayers.map(user => {
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
                پیام دعوت (اختیاری):
              </label>
              <textarea
                value={invitationMessage}
                onChange={(e) => setInvitationMessage(e.target.value)}
                rows={3}
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white resize-none"
                placeholder="پیام دعوت خود را بنویسید..."
                dir="rtl"
              />
            </div>

            <button
              onClick={handleSendInvitation}
              disabled={!selectedPlayer || !allianceName.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>ارسال دعوت</span>
            </button>
          </div>
        </div>
      )}

      {/* Alliance Invitations */}
      <div className="bg-white/10 rounded-lg p-6">
        <h4 className="text-xl font-bold text-white mb-4" dir="rtl">دعوت‌های اتحاد</h4>
        
        <div className="space-y-3">
          {myInvitations.map((invitation) => {
            const isMyInvitation = invitation.sender === state.currentUser?.id;
            const otherUser = state.users.find(u => u.id === (isMyInvitation ? invitation.target : invitation.sender));
            const otherCountry = otherUser?.country ? state.countries.find(c => c.id === otherUser.country) : null;
            
            return (
              <div key={invitation.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2" dir="rtl">
                    {otherCountry && <span className="text-xl">{otherCountry.flag}</span>}
                    <div>
                      <div className="font-bold text-white">
                        {isMyInvitation ? `دعوت به ${otherUser?.username}` : `دعوت از ${otherUser?.username}`}
                      </div>
                      <div className="text-sm text-blue-400">اتحاد: {invitation.allianceName}</div>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    invitation.status === 'pending' 
                      ? 'bg-yellow-600/20 text-yellow-400'
                      : invitation.status === 'accepted'
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-red-600/20 text-red-400'
                  }`}>
                    {invitation.status === 'pending' ? 'در انتظار' :
                     invitation.status === 'accepted' ? 'پذیرفته شده' : 'رد شده'}
                  </span>
                </div>
                
                {invitation.message && (
                  <div className="text-sm text-gray-300 mb-2" dir="rtl">
                    پیام: {invitation.message}
                  </div>
                )}
                
                <div className="text-xs text-gray-400 mb-3">
                  {new Date(invitation.createdAt).toLocaleString('fa-IR')}
                </div>

                {!isMyInvitation && invitation.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRespondToInvitation(invitation.id, false)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors flex items-center justify-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>رد</span>
                    </button>
                    <button
                      onClick={() => handleRespondToInvitation(invitation.id, true)}
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
          
          {myInvitations.length === 0 && (
            <div className="text-center text-gray-400 py-8" dir="rtl">
              <Handshake className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>هنوز دعوت اتحادی ارسال یا دریافت نکرده‌اید</p>
            </div>
          )}
        </div>
      </div>

      {availablePlayers.length === 0 && myAlliances.length === 0 && (
        <div className="text-center text-gray-400 py-8" dir="rtl">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>بازیکن مناسبی برای تشکیل اتحاد وجود ندارد</p>
        </div>
      )}
    </div>
  );
};

export default AllianceManagement;