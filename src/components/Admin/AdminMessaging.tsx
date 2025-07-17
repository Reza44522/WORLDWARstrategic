import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { Send, MessageCircle, Users, Megaphone, User, Calendar, Clock } from 'lucide-react';
import { ChatMessage, GameEvent } from '../../types';

const AdminMessaging: React.FC = () => {
  const { state, dispatch } = useGame();
  const [messageType, setMessageType] = useState<'announcement' | 'private' | 'event'>('announcement');
  const [message, setMessage] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [messageTitle, setMessageTitle] = useState('');
  const [eventDuration, setEventDuration] = useState(24); // hours

  const players = state.users.filter(u => u.role === 'player');

  const sendMessage = () => {
    if (!message.trim() || !state.currentUser) return;
    
    if (messageType === 'private' && !selectedPlayer) {
      alert('لطفاً بازیکن مورد نظر را انتخاب کنید');
      return;
    }

    if (messageType === 'event') {
      if (!messageTitle.trim()) {
        alert('لطفاً عنوان رویداد را وارد کنید');
        return;
      }

      // Create game event
      const gameEvent: GameEvent = {
        id: Date.now().toString(),
        title: messageTitle.trim(),
        message: message.trim(),
        createdBy: state.currentUser.id,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + eventDuration * 60 * 60 * 1000),
        isActive: true
      };

      dispatch({ type: 'CREATE_GAME_EVENT', payload: gameEvent });
      alert(`رویداد با موفقیت ایجاد شد و به مدت ${eventDuration} ساعت فعال خواهد بود`);
    } else if (messageType === 'announcement') {
      // Send announcement to all players
      const announcementMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: state.currentUser.id,
        senderName: '🔴 اعلان مدیریت',
        content: messageTitle ? `📢 ${messageTitle}\n\n${message}` : `📢 ${message}`,
        timestamp: new Date(),
        type: 'admin_announcement',
        isAdminMessage: true
      };

      dispatch({ type: 'SEND_MESSAGE', payload: announcementMessage });
      alert('اعلان با موفقیت به همه بازیکنان ارسال شد');
    } else {
      // Send private message to selected player
      const privateMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: state.currentUser.id,
        senderName: '🔴 پیام مدیریت',
        content: messageTitle ? `📩 ${messageTitle}\n\n${message}` : `📩 ${message}`,
        timestamp: new Date(),
        type: 'admin_private',
        recipient: selectedPlayer,
        isAdminMessage: true
      };

      dispatch({ type: 'SEND_MESSAGE', payload: privateMessage });
      const playerName = players.find(p => p.id === selectedPlayer)?.username;
      alert(`پیام خصوصی با موفقیت به ${playerName} ارسال شد`);
    }

    setMessage('');
    setMessageTitle('');
    setSelectedPlayer('');
  };

  const recentAdminMessages = state.chatMessages
    .filter(msg => msg.isAdminMessage)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  const activeEvents = state.gameEvents
    .filter(event => event.isActive && new Date(event.expiresAt) > new Date())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white" dir="rtl">پیام‌رسانی مدیریت</h2>
        <div className="text-sm text-gray-300" dir="rtl">
          ارسال پیام و ایجاد رویداد
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Message Composer */}
        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2" dir="rtl">
            <Send className="w-6 h-6" />
            <span>ارسال پیام جدید</span>
          </h3>

          <div className="space-y-4">
            {/* Message Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                نوع پیام:
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setMessageType('announcement')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    messageType === 'announcement'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                  }`}
                >
                  <Megaphone className="w-4 h-4" />
                  <span>اعلان عمومی</span>
                </button>
                <button
                  onClick={() => setMessageType('private')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    messageType === 'private'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>پیام خصوصی</span>
                </button>
                <button
                  onClick={() => setMessageType('event')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    messageType === 'event'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>رویداد</span>
                </button>
              </div>
            </div>

            {/* Player Selection for Private Messages */}
            {messageType === 'private' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                  انتخاب بازیکن:
                </label>
                <select
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  dir="rtl"
                >
                  <option value="">بازیکن مورد نظر را انتخاب کنید</option>
                  {players.map(player => {
                    const playerCountry = player.country ? state.countries.find(c => c.id === player.country) : null;
                    return (
                      <option key={player.id} value={player.id}>
                        {player.username} {playerCountry ? `(${playerCountry.name})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Event Duration */}
            {messageType === 'event' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                  مدت نمایش رویداد (ساعت):
                </label>
                <input
                  type="number"
                  value={eventDuration}
                  onChange={(e) => setEventDuration(parseInt(e.target.value) || 24)}
                  min="1"
                  max="168"
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500"
                  dir="rtl"
                />
              </div>
            )}

            {/* Message Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                {messageType === 'event' ? 'عنوان رویداد (اجباری):' : 'عنوان پیام (اختیاری):'}
              </label>
              <input
                type="text"
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                placeholder={messageType === 'event' ? 'عنوان رویداد...' : 'عنوان پیام...'}
                dir="rtl"
              />
            </div>

            {/* Message Content */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                {messageType === 'event' ? 'متن رویداد:' : 'متن پیام:'}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder={
                  messageType === 'event' 
                    ? 'متن رویداد خود را بنویسید...'
                    : messageType === 'announcement' 
                    ? 'متن اعلان عمومی خود را بنویسید...'
                    : 'متن پیام خصوصی خود را بنویسید...'
                }
                dir="rtl"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={sendMessage}
              disabled={!message.trim() || (messageType === 'private' && !selectedPlayer) || (messageType === 'event' && !messageTitle.trim())}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>
                {messageType === 'event' ? 'ایجاد رویداد' :
                 messageType === 'announcement' ? 'ارسال اعلان به همه' : 'ارسال پیام خصوصی'}
              </span>
            </button>
          </div>

          {/* Quick Templates */}
          <div className="mt-6 pt-4 border-t border-gray-600">
            <h4 className="text-sm font-bold text-gray-300 mb-3" dir="rtl">قالب‌های آماده:</h4>
            <div className="space-y-2">
              <button
                onClick={() => setMessage('به بازی World War خوش آمدید! لطفاً قوانین بازی را مطالعه کنید.')}
                className="w-full text-left bg-gray-600 hover:bg-gray-500 text-white text-sm py-2 px-3 rounded transition-colors"
                dir="rtl"
              >
                پیام خوش‌آمدگویی
              </button>
              <button
                onClick={() => setMessage('توجه: فصل جدید بازی فردا شروع خواهد شد. آماده باشید!')}
                className="w-full text-left bg-gray-600 hover:bg-gray-500 text-white text-sm py-2 px-3 rounded transition-colors"
                dir="rtl"
              >
                اعلان شروع فصل
              </button>
              <button
                onClick={() => setMessage('لطفاً از رعایت قوانین بازی و احترام به سایر بازیکنان غافل نشوید.')}
                className="w-full text-left bg-gray-600 hover:bg-gray-500 text-white text-sm py-2 px-3 rounded transition-colors"
                dir="rtl"
              >
                یادآوری قوانین
              </button>
            </div>
          </div>
        </div>

        {/* Recent Messages and Events */}
        <div className="space-y-6">
          {/* Active Events */}
          <div className="bg-white/10 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2" dir="rtl">
              <Calendar className="w-6 h-6" />
              <span>رویدادهای فعال</span>
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {activeEvents.map((event) => (
                <div key={event.id} className="bg-purple-600/20 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-purple-400" dir="rtl">{event.title}</h4>
                    <button
                      onClick={() => {
                        if (confirm('آیا می‌خواهید این رویداد را غیرفعال کنید؟')) {
                          dispatch({ type: 'EXPIRE_GAME_EVENT', payload: { eventId: event.id } });
                        }
                      }}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      غیرفعال
                    </button>
                  </div>
                  
                  <p className="text-white text-sm mb-2 leading-relaxed" dir="rtl">
                    {event.message}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span dir="rtl">
                      ایجاد: {new Date(event.createdAt).toLocaleString('fa-IR')}
                    </span>
                    <span dir="rtl">
                      انقضا: {new Date(event.expiresAt).toLocaleString('fa-IR')}
                    </span>
                  </div>
                </div>
              ))}
              
              {activeEvents.length === 0 && (
                <div className="text-center text-gray-400 py-8" dir="rtl">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>رویداد فعالی وجود ندارد</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Admin Messages */}
          <div className="bg-white/10 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2" dir="rtl">
              <MessageCircle className="w-6 h-6" />
              <span>پیام‌های اخیر مدیریت</span>
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {recentAdminMessages.map((msg) => (
                <div key={msg.id} className="bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2" dir="rtl">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        msg.type === 'admin_announcement' 
                          ? 'bg-red-600/20 text-red-400'
                          : 'bg-blue-600/20 text-blue-400'
                      }`}>
                        {msg.type === 'admin_announcement' ? 'اعلان عمومی' : 'پیام خصوصی'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(msg.timestamp).toLocaleString('fa-IR')}
                    </span>
                  </div>
                  
                  <p className="text-white text-sm mb-2 leading-relaxed" dir="rtl">
                    {msg.content}
                  </p>
                  
                  {msg.type === 'admin_private' && msg.recipient && (
                    <div className="text-xs text-yellow-400" dir="rtl">
                      به: {state.users.find(u => u.id === msg.recipient)?.username}
                    </div>
                  )}
                </div>
              ))}
              
              {recentAdminMessages.length === 0 && (
                <div className="text-center text-gray-400 py-8" dir="rtl">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>هنوز پیامی ارسال نشده است</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white/10 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4" dir="rtl">آمار پیام‌رسانی</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-600/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">
              {state.chatMessages.filter(m => m.type === 'admin_announcement').length}
            </div>
            <div className="text-sm text-gray-300">اعلان‌های عمومی</div>
          </div>
          <div className="bg-blue-600/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {state.chatMessages.filter(m => m.type === 'admin_private').length}
            </div>
            <div className="text-sm text-gray-300">پیام‌های خصوصی</div>
          </div>
          <div className="bg-purple-600/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {activeEvents.length}
            </div>
            <div className="text-sm text-gray-300">رویدادهای فعال</div>
          </div>
          <div className="bg-green-600/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {players.length}
            </div>
            <div className="text-sm text-gray-300">بازیکنان فعال</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessaging;