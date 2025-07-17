import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { Users, Send, CheckCircle, X, Heart, Package } from 'lucide-react';
import { SupportRequest } from '../../types';

const SupportSystem: React.FC = () => {
  const { state, dispatch } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [supportType, setSupportType] = useState<'economic' | 'military' | 'resource' | 'goods'>('economic');
  const [amount, setAmount] = useState(0);
  const [resourceType, setResourceType] = useState<keyof typeof state.currentUser.resources>('missiles');
  const [message, setMessage] = useState('');

  if (!state.currentUser?.country) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-white" dir="rtl">ابتدا کشور خود را انتخاب کنید</p>
      </div>
    );
  }

  const availablePlayers = state.users.filter(u => 
    u.role === 'player' && 
    u.country && 
    u.id !== state.currentUser?.id
  );

  const myRequests = state.supportRequests.filter(r => 
    r.sender === state.currentUser?.id || r.recipient === state.currentUser?.id
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const resourceNames = {
    missiles: 'موشک',
    tanks: 'تانک',
    aircraft: 'هواپیما',
    submarines: 'زیردریایی',
    ships: 'کشتی',
    weapons: 'سلاح',
    soldiers: 'سرباز'
  };

  const goodsResourceNames = {
    oil: 'نفت',
    food: 'غذا',
    metals: 'فلزات',
    goods: 'کالا',
    electricity: 'برق'
  };

  const handleSendRequest = () => {
    if (!selectedPlayer || amount <= 0) {
      alert('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    const recipient = state.users.find(u => u.id === selectedPlayer);
    if (!recipient) return;

    const request: SupportRequest = {
      id: Date.now().toString(),
      sender: state.currentUser!.id,
      senderName: state.currentUser!.username,
      recipient: selectedPlayer,
      recipientName: recipient.username,
      type: supportType,
      amount,
      resourceType: supportType === 'economic' ? 'money' : resourceType,
      message: message.trim() || undefined,
      status: 'pending',
      createdAt: new Date()
    };

    dispatch({ type: 'CREATE_SUPPORT_REQUEST', payload: request });
    
    // Reset form
    setSelectedPlayer('');
    setAmount(0);
    setMessage('');
    
    alert(`درخواست حمایت به ${recipient.username} ارسال شد`);
  };

  const handleRespondToRequest = (requestId: string, accepted: boolean) => {
    const request = state.supportRequests.find(r => r.id === requestId);
    if (!request) return;

    if (accepted) {
      // Check if sender has enough resources
      if (request.type === 'economic' && request.amount > state.currentUser!.money) {
        alert('پول کافی ندارید');
        return;
      }
      
      if ((request.type === 'military' || request.type === 'resource' || request.type === 'goods') && 
          request.resourceType && 
          request.resourceType !== 'money' &&
          request.amount > state.currentUser!.resources[request.resourceType as keyof typeof state.currentUser.resources]) {
        alert('منابع کافی ندارید');
        return;
      }
    }

    dispatch({ 
      type: 'RESPOND_SUPPORT_REQUEST', 
      payload: { requestId, accepted } 
    });
    
    alert(accepted ? 'درخواست حمایت پذیرفته شد' : 'درخواست حمایت رد شد');
  };

  const getSupportTypeLabel = (type: string) => {
    switch (type) {
      case 'economic': return 'اقتصادی';
      case 'military': return 'نظامی';
      case 'resource': return 'منابع';
      case 'goods': return 'کالایی';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2" dir="rtl">سیستم حمایت</h3>
        <p className="text-gray-300" dir="rtl">از سایر کشورها حمایت درخواست کنید</p>
      </div>

      {/* Send Support Request */}
      <div className="bg-white/10 rounded-lg p-6">
        <h4 className="text-xl font-bold text-white mb-4" dir="rtl">درخواست حمایت</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
              انتخاب بازیکن:
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
              نوع حمایت:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => setSupportType('economic')}
                className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                  supportType === 'economic'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                }`}
              >
                اقتصادی
              </button>
              <button
                onClick={() => setSupportType('military')}
                className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                  supportType === 'military'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                }`}
              >
                نظامی
              </button>
              <button
                onClick={() => setSupportType('resource')}
                className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                  supportType === 'resource'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                }`}
              >
                منابع
              </button>
              <button
                onClick={() => setSupportType('goods')}
                className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                  supportType === 'goods'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                }`}
              >
                کالایی
              </button>
            </div>
          </div>

          {supportType === 'military' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                نوع تجهیزات نظامی:
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as keyof typeof state.currentUser.resources)}
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
                dir="rtl"
              >
                {Object.entries(resourceNames).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
          )}

          {supportType === 'goods' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                نوع کالا:
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as keyof typeof state.currentUser.resources)}
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
                dir="rtl"
              >
                {Object.entries(goodsResourceNames).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
              مقدار:
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              min="1"
              className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
              placeholder={
                supportType === 'economic' ? 'مقدار پول (WD)' : 
                supportType === 'goods' ? 'مقدار کالا' :
                'تعداد'
              }
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
              پیام (اختیاری):
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white resize-none"
              placeholder="دلیل درخواست حمایت خود را بنویسید..."
              dir="rtl"
            />
          </div>

          <button
            onClick={handleSendRequest}
            disabled={!selectedPlayer || amount <= 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Send className="w-5 h-5" />
            <span>ارسال درخواست</span>
          </button>
        </div>
      </div>

      {/* Support Requests */}
      <div className="bg-white/10 rounded-lg p-6">
        <h4 className="text-xl font-bold text-white mb-4" dir="rtl">درخواست‌های حمایت</h4>
        
        <div className="space-y-3">
          {myRequests.map((request) => {
            const isMyRequest = request.sender === state.currentUser?.id;
            const otherUser = state.users.find(u => u.id === (isMyRequest ? request.recipient : request.sender));
            const otherCountry = otherUser?.country ? state.countries.find(c => c.id === otherUser.country) : null;
            
            return (
              <div key={request.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2" dir="rtl">
                    {otherCountry && <span className="text-xl">{otherCountry.flag}</span>}
                    <div>
                      <div className="font-bold text-white">
                        {isMyRequest ? `درخواست از ${otherUser?.username}` : `درخواست ${otherUser?.username}`}
                      </div>
                      <div className="text-sm text-gray-300">
                        حمایت {getSupportTypeLabel(request.type)}: {request.amount.toLocaleString()} 
                        {request.type === 'economic' ? ' WD' : 
                         request.type === 'military' ? ` ${resourceNames[request.resourceType as keyof typeof resourceNames] || request.resourceType}` :
                         request.type === 'goods' ? ` ${goodsResourceNames[request.resourceType as keyof typeof goodsResourceNames] || request.resourceType}` :
                         ` ${request.resourceType}`}
                      </div>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    request.status === 'pending' 
                      ? 'bg-yellow-600/20 text-yellow-400'
                      : request.status === 'accepted'
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-red-600/20 text-red-400'
                  }`}>
                    {request.status === 'pending' ? 'در انتظار' :
                     request.status === 'accepted' ? 'پذیرفته شده' : 'رد شده'}
                  </span>
                </div>
                
                {request.message && (
                  <div className="text-sm text-gray-300 mb-2" dir="rtl">
                    پیام: {request.message}
                  </div>
                )}
                
                <div className="text-xs text-gray-400 mb-3">
                  {new Date(request.createdAt).toLocaleString('fa-IR')}
                </div>

                {!isMyRequest && request.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRespondToRequest(request.id, false)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors flex items-center justify-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>رد</span>
                    </button>
                    <button
                      onClick={() => handleRespondToRequest(request.id, true)}
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
          
          {myRequests.length === 0 && (
            <div className="text-center text-gray-400 py-8" dir="rtl">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>هنوز درخواست حمایتی ارسال یا دریافت نکرده‌اید</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportSystem;