import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { MessageCircle, AlertTriangle, Eye, Filter } from 'lucide-react';

const ChatMonitoring: React.FC = () => {
  const { state } = useGame();
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private' | 'alliance'>('all');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  const filteredMessages = state.chatMessages.filter(msg => 
    filterType === 'all' || msg.type === filterType
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleReportMessage = (messageId: string) => {
    if (confirm('آیا این پیام را به عنوان گزارش تخلف ثبت می‌کنید؟')) {
      // In a real app, this would flag the message
      alert('پیام گزارش شد');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white" dir="rtl">نظارت بر چت</h2>
        <div className="text-sm text-gray-300" dir="rtl">
          کل پیام‌ها: {state.chatMessages.length}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 rounded-lg p-4">
        <div className="flex items-center space-x-4" dir="rtl">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-white font-medium">فیلتر:</span>
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'همه' },
              { key: 'public', label: 'عمومی' },
              { key: 'private', label: 'خصوصی' },
              { key: 'alliance', label: 'اتحاد' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterType(filter.key as any)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  filterType === filter.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="xl:col-span-2">
          <div className="bg-white/10 rounded-lg max-h-[600px] overflow-hidden">
            <div className="bg-white/20 p-4 border-b border-gray-600">
              <h3 className="font-bold text-white" dir="rtl">پیام‌های چت</h3>
            </div>
            <div className="overflow-y-auto max-h-[500px] divide-y divide-gray-600">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 hover:bg-white/5 cursor-pointer transition-colors ${
                    selectedMessage === message.id ? 'bg-blue-500/20' : ''
                  }`}
                  onClick={() => setSelectedMessage(message.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2" dir="rtl">
                      <span className="font-bold text-white">{message.senderName}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        message.type === 'public' 
                          ? 'bg-blue-600/20 text-blue-400'
                          : message.type === 'private'
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-purple-600/20 text-purple-400'
                      }`}>
                        {message.type === 'public' ? 'عمومی' : 
                         message.type === 'private' ? 'خصوصی' : 'اتحاد'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(message.timestamp).toLocaleString('fa-IR')}
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-2" dir="rtl">{message.content}</p>
                  
                  {message.type === 'private' && message.recipient && (
                    <div className="text-xs text-yellow-400" dir="rtl">
                      به: {state.users.find(u => u.id === message.recipient)?.username}
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReportMessage(message.id);
                      }}
                      className="text-red-400 hover:text-red-300 text-xs flex items-center space-x-1"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>گزارش</span>
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredMessages.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p dir="rtl">پیامی برای نمایش وجود ندارد</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Details */}
        <div>
          {selectedMessage ? (
            <div className="bg-white/10 rounded-lg p-6">
              {(() => {
                const message = state.chatMessages.find(m => m.id === selectedMessage);
                const sender = message ? state.users.find(u => u.id === message.sender) : null;
                const recipient = message?.recipient ? state.users.find(u => u.id === message.recipient) : null;
                
                if (!message || !sender) return null;
                
                return (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white" dir="rtl">جزئیات پیام</h3>
                    </div>

                    <div className="bg-blue-600/20 rounded-lg p-4">
                      <h4 className="font-bold text-blue-400 mb-2" dir="rtl">فرستنده:</h4>
                      <div className="text-white space-y-1">
                        <div>{sender.username}</div>
                        <div className="text-sm text-gray-300">{sender.email}</div>
                      </div>
                    </div>

                    {recipient && (
                      <div className="bg-green-600/20 rounded-lg p-4">
                        <h4 className="font-bold text-green-400 mb-2" dir="rtl">گیرنده:</h4>
                        <div className="text-white space-y-1">
                          <div>{recipient.username}</div>
                          <div className="text-sm text-gray-300">{recipient.email}</div>
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-600/20 rounded-lg p-4">
                      <h4 className="font-bold text-gray-400 mb-2" dir="rtl">متن پیام:</h4>
                      <p className="text-white text-sm leading-relaxed" dir="rtl">
                        {message.content}
                      </p>
                    </div>

                    <div className="bg-yellow-600/20 rounded-lg p-4">
                      <h4 className="font-bold text-yellow-400 mb-2" dir="rtl">اطلاعات پیام:</h4>
                      <div className="text-sm text-white space-y-1">
                        <div>نوع: {
                          message.type === 'public' ? 'عمومی' :
                          message.type === 'private' ? 'خصوصی' : 'اتحاد'
                        }</div>
                        <div>زمان ارسال: {new Date(message.timestamp).toLocaleString('fa-IR')}</div>
                        <div>شناسه پیام: {message.id}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleReportMessage(message.id)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
                      >
                        گزارش تخلف
                      </button>
                      
                      <button
                        onClick={() => {
                          if (confirm('آیا می‌خواهید این پیام را حذف کنید؟')) {
                            const updatedMessages = state.chatMessages.filter(m => m.id !== message.id);
                            // In a real app, this would make an API call
                            alert('پیام حذف شد');
                          }
                        }}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
                      >
                        حذف پیام
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white/10 rounded-lg p-6 text-center">
              <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2" dir="rtl">انتخاب پیام</h3>
              <p className="text-gray-400 text-sm" dir="rtl">
                روی هر پیام کلیک کنید تا جزئیات آن را مشاهده کنید
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMonitoring;