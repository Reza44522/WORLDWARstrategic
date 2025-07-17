import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Users, Lock, Megaphone, HelpCircle, Flag } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { ChatMessage, SupportTicket, TicketResponse, UserReport } from '../../types';

const Chat: React.FC = () => {
  const { state, dispatch } = useGame();
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'public' | 'private' | 'alliance' | 'admin' | 'support'>('public');
  const [selectedUser, setSelectedUser] = useState('');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportedUser, setReportedUser] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.chatMessages, state.supportTickets]);

  useEffect(() => {
    // Mark messages as read when switching tabs
    if (activeTab !== 'support') {
      dispatch({ type: 'MARK_MESSAGES_READ', payload: { type: activeTab } });
    }
  }, [activeTab, dispatch]);

  const sendMessage = () => {
    if (!message.trim() || !state.currentUser) return;

    // Check if user is muted
    if (state.currentUser.isMuted) {
      const muteExpiry = state.currentUser.muteExpiresAt 
        ? new Date(state.currentUser.muteExpiresAt).toLocaleString('fa-IR')
        : 'نامحدود';
      alert(`شما میوت شده‌اید و نمی‌توانید پیام ارسال کنید. انقضا: ${muteExpiry}`);
      return;
    }

    // Check if user is timed out
    if (state.currentUser.isTimedOut) {
      const timeoutExpiry = state.currentUser.timeoutExpiresAt 
        ? new Date(state.currentUser.timeoutExpiresAt).toLocaleString('fa-IR')
        : 'نامحدود';
      alert(`شما تایم‌اوت شده‌اید و نمی‌توانید پیام ارسال کنید. انقضا: ${timeoutExpiry}`);
      return;
    }

    const currentUserCountry = state.currentUser.country 
      ? state.countries.find(c => c.id === state.currentUser.country)
      : null;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: state.currentUser.id,
      senderName: state.currentUser.username,
      content: message.trim(),
      timestamp: new Date(),
      type: activeTab === 'admin' ? 'public' : activeTab,
      recipient: activeTab === 'private' ? selectedUser : undefined,
      allianceId: activeTab === 'alliance' ? state.alliances.find(a => a.members.includes(state.currentUser!.id))?.id : undefined,
      senderCountry: currentUserCountry?.name,
      isRead: false
    };

    dispatch({ type: 'SEND_MESSAGE', payload: newMessage });
    setMessage('');
  };

  const sendSupportTicket = () => {
    if (!supportSubject.trim() || !supportMessage.trim() || !state.currentUser) {
      alert('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    const ticket: SupportTicket = {
      id: Date.now().toString(),
      sender: state.currentUser.id,
      senderName: state.currentUser.username,
      subject: supportSubject.trim(),
      message: supportMessage.trim(),
      status: 'open',
      createdAt: new Date(),
      responses: []
    };

    dispatch({ type: 'CREATE_SUPPORT_TICKET', payload: ticket });
    alert('تیکت پشتیبانی ارسال شد');
    setSupportSubject('');
    setSupportMessage('');
  };

  const handleReportUser = () => {
    if (!reportedUser || !reportReason.trim() || !reportDescription.trim() || !state.currentUser) {
      alert('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    const reportedUserData = state.users.find(u => u.id === reportedUser);
    if (!reportedUserData) return;

    const report: UserReport = {
      id: Date.now().toString(),
      reporterId: state.currentUser.id,
      reporterName: state.currentUser.username,
      reportedUserId: reportedUser,
      reportedUserName: reportedUserData.username,
      reason: reportReason.trim(),
      description: reportDescription.trim(),
      status: 'pending',
      createdAt: new Date()
    };

    dispatch({ type: 'CREATE_USER_REPORT', payload: report });
    alert('گزارش کاربر ارسال شد');
    setShowReportModal(false);
    setReportedUser('');
    setReportReason('');
    setReportDescription('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (activeTab === 'support') {
        sendSupportTicket();
      } else {
        sendMessage();
      }
    }
  };

  const filteredMessages = state.chatMessages.filter(msg => {
    if (activeTab === 'public') return msg.type === 'public';
    if (activeTab === 'private') {
      return msg.type === 'private' && 
        ((msg.sender === state.currentUser?.id && msg.recipient === selectedUser) ||
         (msg.recipient === state.currentUser?.id && msg.sender === selectedUser));
    }
    if (activeTab === 'alliance') {
      const userAlliance = state.alliances.find(a => a.members.includes(state.currentUser?.id || ''));
      return msg.type === 'alliance' && msg.allianceId === userAlliance?.id;
    }
    if (activeTab === 'admin') {
      return msg.type === 'admin_announcement' || 
        (msg.type === 'admin_private' && 
         (msg.recipient === state.currentUser?.id || msg.sender === state.currentUser?.id));
    }
    return false;
  });

  const otherUsers = state.users.filter(u => u.id !== state.currentUser?.id && u.role === 'player');

  // Count unread admin messages
  const unreadAdminMessages = state.chatMessages.filter(msg => 
    (msg.type === 'admin_announcement' || 
     (msg.type === 'admin_private' && msg.recipient === state.currentUser?.id)) &&
    !msg.isRead &&
    new Date(msg.timestamp).getTime() > (Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
  ).length;

  // Get user's support tickets
  const userTickets = state.supportTickets.filter(ticket => 
    ticket.sender === state.currentUser?.id
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Check if user is in an alliance
  const userAlliance = state.alliances.find(a => a.members.includes(state.currentUser?.id || ''));

  const renderSupportTab = () => (
    <div className="space-y-4">
      {/* Create New Ticket */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-bold text-blue-800 mb-3" dir="rtl">ارسال تیکت جدید</h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1" dir="rtl">موضوع:</label>
            <input
              type="text"
              value={supportSubject}
              onChange={(e) => setSupportSubject(e.target.value)}
              className="w-full p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="موضوع تیکت خود را وارد کنید"
              dir="rtl"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1" dir="rtl">پیام:</label>
            <textarea
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              rows={4}
              className="w-full p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="پیام خود را برای پشتیبانی بنویسید..."
              dir="rtl"
            />
          </div>
          
          <button
            onClick={sendSupportTicket}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            ارسال تیکت
          </button>
        </div>
      </div>

      {/* User's Tickets */}
      <div className="space-y-3">
        <h4 className="font-bold text-gray-800" dir="rtl">تیکت های شما</h4>
        
        {userTickets.length === 0 ? (
          <div className="text-center text-gray-500 py-4" dir="rtl">
            <HelpCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>هنوز تیکتی ارسال نکرده‌اید</p>
          </div>
        ) : (
          userTickets.map((ticket) => (
            <div key={ticket.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h5 className="font-bold text-gray-800" dir="rtl">{ticket.subject}</h5>
                  <p className="text-sm text-gray-600" dir="rtl">{ticket.message}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  ticket.status === 'open' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {ticket.status === 'open' ? 'باز' : 'بسته'}
                </span>
              </div>
              
              <div className="text-xs text-gray-500 mb-3">
                {new Date(ticket.createdAt).toLocaleString('fa-IR')}
              </div>

              {/* Responses */}
              {ticket.responses.length > 0 && (
                <div className="space-y-2 border-t border-gray-200 pt-3">
                  <h6 className="font-bold text-sm text-gray-700" dir="rtl">پاسخ ها:</h6>
                  {ticket.responses.map((response) => (
                    <div key={response.id} className={`p-2 rounded ${
                      response.isAdmin 
                        ? 'bg-blue-100 border-l-4 border-blue-500' 
                        : 'bg-gray-100'
                    }`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm" dir="rtl">
                          {response.senderName}
                          {response.isAdmin && (
                            <span className="text-blue-600 mr-1">(پشتیبانی)</span>
                          )}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(response.createdAt).toLocaleTimeString('fa-IR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700" dir="rtl">{response.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg h-96 flex flex-col">
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('public')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'public'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>عمومی</span>
          </button>
          <button
            onClick={() => setActiveTab('private')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'private'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>خصوصی</span>
          </button>
          {userAlliance && (
            <button
              onClick={() => setActiveTab('alliance')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'alliance'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>اتحاد</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('admin')}
            className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'admin'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>اعلانات</span>
            {unreadAdminMessages > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadAdminMessages > 9 ? '9+' : unreadAdminMessages}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'support'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>پشتیبانی</span>
          </button>
        </div>

        {activeTab === 'private' && (
          <div className="mt-3">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              dir="rtl"
            >
              <option value="">بازیکن مورد نظر را انتخاب کنید</option>
              {otherUsers.map(user => {
                const userCountry = user.country ? state.countries.find(c => c.id === user.country) : null;
                return (
                  <option key={user.id} value={user.id}>
                    {userCountry?.flag} {user.username} ({userCountry?.name || 'بدون کشور'})
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === 'support' ? (
          renderSupportTab()
        ) : (
          <>
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.isAdminMessage 
                    ? 'justify-center' 
                    : msg.sender === state.currentUser?.id 
                    ? 'justify-end' 
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
                    msg.isAdminMessage
                      ? 'bg-red-100 border-2 border-red-300 text-red-800 max-w-full'
                      : msg.sender === state.currentUser?.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <div className="font-bold text-sm mb-1" dir="rtl">
                    {msg.senderName}
                    {msg.senderCountry && (
                      <span className="text-xs opacity-75 mr-1">({msg.senderCountry})</span>
                    )}
                  </div>
                  <div className="text-sm whitespace-pre-line" dir="rtl">{msg.content}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString('fa-IR')}
                  </div>
                  
                  {/* Report button for other users' messages */}
                  {msg.sender !== state.currentUser?.id && !msg.isAdminMessage && (
                    <button
                      onClick={() => {
                        setReportedUser(msg.sender);
                        setShowReportModal(true);
                      }}
                      className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      title="گزارش کاربر"
                    >
                      <Flag className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input - Hide for admin and support tabs */}
      {activeTab !== 'admin' && activeTab !== 'support' && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                activeTab === 'private' && !selectedUser
                  ? 'ابتدا بازیکن مورد نظر را انتخاب کنید'
                  : activeTab === 'alliance' && !userAlliance
                  ? 'ابتدا عضو اتحادی شوید'
                  : state.currentUser?.isMuted
                  ? 'شما میوت شده‌اید'
                  : state.currentUser?.isTimedOut
                  ? 'شما تایم‌اوت شده‌اید'
                  : 'پیام خود را بنویسید...'
              }
              disabled={
                (activeTab === 'private' && !selectedUser) || 
                (activeTab === 'alliance' && !userAlliance) ||
                state.currentUser?.isMuted ||
                state.currentUser?.isTimedOut
              }
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              dir="rtl"
            />
          </div>
        </div>
      )}

      {/* Tab Info */}
      {activeTab === 'admin' && (
        <div className="border-t border-gray-200 p-4 bg-red-50">
          <div className="text-center text-sm text-red-600" dir="rtl">
            <Megaphone className="w-4 h-4 inline-block ml-1" />
            اعلانات و پیام‌های مدیریت
          </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="border-t border-gray-200 p-4 bg-orange-50">
          <div className="text-center text-sm text-orange-600" dir="rtl">
            <HelpCircle className="w-4 h-4 inline-block ml-1" />
            ارتباط با پشتیبانی و ارسال تیکت
          </div>
        </div>
      )}

      {activeTab === 'alliance' && !userAlliance && (
        <div className="border-t border-gray-200 p-4 bg-purple-50">
          <div className="text-center text-sm text-purple-600" dir="rtl">
            <Users className="w-4 h-4 inline-block ml-1" />
            ابتدا عضو اتحادی شوید تا بتوانید در چت اتحاد شرکت کنید
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4" dir="rtl">گزارش کاربر</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" dir="rtl">
                  دلیل گزارش:
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  dir="rtl"
                >
                  <option value="">انتخاب کنید</option>
                  <option value="spam">اسپم</option>
                  <option value="harassment">آزار و اذیت</option>
                  <option value="inappropriate">محتوای نامناسب</option>
                  <option value="cheating">تقلب</option>
                  <option value="other">سایر</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" dir="rtl">
                  توضیحات:
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                  placeholder="توضیحات بیشتر..."
                  dir="rtl"
                />
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={handleReportUser}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                ارسال گزارش
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;