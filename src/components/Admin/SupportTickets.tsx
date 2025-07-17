import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { HelpCircle, MessageCircle, Send, Clock, CheckCircle, X, User } from 'lucide-react';
import { TicketResponse } from '../../types';

const SupportTickets: React.FC = () => {
  const { state, dispatch } = useGame();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');

  const filteredTickets = state.supportTickets.filter(ticket => 
    filterStatus === 'all' || ticket.status === filterStatus
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const selectedTicketData = selectedTicket 
    ? state.supportTickets.find(t => t.id === selectedTicket) 
    : null;

  const handleSendResponse = () => {
    if (!responseMessage.trim() || !selectedTicket || !state.currentUser) {
      alert('لطفاً پیام خود را وارد کنید');
      return;
    }

    const response: TicketResponse = {
      id: Date.now().toString(),
      ticketId: selectedTicket,
      sender: state.currentUser.id,
      senderName: state.currentUser.username,
      message: responseMessage.trim(),
      isAdmin: true,
      createdAt: new Date()
    };

    dispatch({ 
      type: 'RESPOND_SUPPORT_TICKET', 
      payload: { ticketId: selectedTicket, response }
    });

    setResponseMessage('');
    alert('پاسخ ارسال شد');
  };

  const handleCloseTicket = (ticketId: string) => {
    if (confirm('آیا می‌خواهید این تیکت را بسته کنید؟')) {
      dispatch({ type: 'CLOSE_SUPPORT_TICKET', payload: { ticketId } });
      if (selectedTicket === ticketId) {
        setSelectedTicket(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white" dir="rtl">تیکت های پشتیبانی</h2>
        <div className="text-sm text-gray-300" dir="rtl">
          کل تیکت ها: {state.supportTickets.length}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 rounded-lg p-4">
        <div className="flex items-center space-x-4" dir="rtl">
          <span className="text-white font-medium">فیلتر:</span>
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'همه' },
              { key: 'open', label: 'باز' },
              { key: 'closed', label: 'بسته' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterStatus(filter.key as any)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  filterStatus === filter.key
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
        {/* Tickets List */}
        <div className="xl:col-span-2">
          <div className="bg-white/10 rounded-lg max-h-[600px] overflow-hidden">
            <div className="bg-white/20 p-4 border-b border-gray-600">
              <h3 className="font-bold text-white" dir="rtl">لیست تیکت ها</h3>
            </div>
            <div className="overflow-y-auto max-h-[500px] divide-y divide-gray-600">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`p-4 hover:bg-white/5 cursor-pointer transition-colors ${
                    selectedTicket === ticket.id ? 'bg-blue-500/20' : ''
                  }`}
                  onClick={() => setSelectedTicket(ticket.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2" dir="rtl">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-white">{ticket.senderName}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        ticket.status === 'open' 
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-gray-600/20 text-gray-400'
                      }`}>
                        {ticket.status === 'open' ? 'باز' : 'بسته'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(ticket.createdAt).toLocaleString('fa-IR')}
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-white text-sm mb-1" dir="rtl">{ticket.subject}</h4>
                  <p className="text-gray-300 text-sm mb-2 line-clamp-2" dir="rtl">{ticket.message}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-blue-400" dir="rtl">
                      {ticket.responses.length} پاسخ
                    </div>
                    {ticket.status === 'open' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseTicket(ticket.id);
                        }}
                        className="text-red-400 hover:text-red-300 text-xs flex items-center space-x-1"
                      >
                        <X className="w-3 h-3" />
                        <span>بستن</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredTickets.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p dir="rtl">تیکتی برای نمایش وجود ندارد</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ticket Details */}
        <div>
          {selectedTicketData ? (
            <div className="bg-white/10 rounded-lg p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white" dir="rtl">جزئیات تیکت</h3>
                </div>

                <div className="bg-blue-600/20 rounded-lg p-4">
                  <h4 className="font-bold text-blue-400 mb-2" dir="rtl">فرستنده:</h4>
                  <div className="text-white">{selectedTicketData.senderName}</div>
                </div>

                <div className="bg-green-600/20 rounded-lg p-4">
                  <h4 className="font-bold text-green-400 mb-2" dir="rtl">موضوع:</h4>
                  <div className="text-white">{selectedTicketData.subject}</div>
                </div>

                <div className="bg-gray-600/20 rounded-lg p-4">
                  <h4 className="font-bold text-gray-400 mb-2" dir="rtl">پیام:</h4>
                  <p className="text-white text-sm leading-relaxed" dir="rtl">
                    {selectedTicketData.message}
                  </p>
                </div>

                <div className="bg-yellow-600/20 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2" dir="rtl">اطلاعات تیکت:</h4>
                  <div className="text-sm text-white space-y-1">
                    <div>وضعیت: {selectedTicketData.status === 'open' ? 'باز' : 'بسته'}</div>
                    <div>زمان ایجاد: {new Date(selectedTicketData.createdAt).toLocaleString('fa-IR')}</div>
                    <div>تعداد پاسخ ها: {selectedTicketData.responses.length}</div>
                  </div>
                </div>

                {/* Responses */}
                {selectedTicketData.responses.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-bold text-white mb-3" dir="rtl">پاسخ ها:</h4>
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {selectedTicketData.responses.map((response) => (
                        <div key={response.id} className={`p-3 rounded ${
                          response.isAdmin 
                            ? 'bg-blue-600/20 border-r-4 border-blue-500' 
                            : 'bg-gray-600/20'
                        }`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm text-white" dir="rtl">
                              {response.senderName}
                              {response.isAdmin && (
                                <span className="text-blue-400 mr-1">(پشتیبانی)</span>
                              )}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(response.createdAt).toLocaleTimeString('fa-IR')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300" dir="rtl">{response.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Response Form */}
                {selectedTicketData.status === 'open' && (
                  <div className="bg-green-600/20 rounded-lg p-4">
                    <h4 className="font-bold text-green-400 mb-3" dir="rtl">ارسال پاسخ:</h4>
                    <div className="space-y-3">
                      <textarea
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        rows={4}
                        className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white resize-none"
                        placeholder="پاسخ خود را بنویسید..."
                        dir="rtl"
                      />
                      <button
                        onClick={handleSendResponse}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors flex items-center justify-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>ارسال پاسخ</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  {selectedTicketData.status === 'open' && (
                    <button
                      onClick={() => handleCloseTicket(selectedTicketData.id)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
                    >
                      بستن تیکت
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 rounded-lg p-6 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2" dir="rtl">انتخاب تیکت</h3>
              <p className="text-gray-400 text-sm" dir="rtl">
                روی هر تیکت کلیک کنید تا جزئیات آن را مشاهده کنید
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white/10 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4" dir="rtl">آمار تیکت ها</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-600/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {state.supportTickets.filter(t => t.status === 'open').length}
            </div>
            <div className="text-sm text-gray-300">تیکت های باز</div>
          </div>
          <div className="bg-gray-600/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-400">
              {state.supportTickets.filter(t => t.status === 'closed').length}
            </div>
            <div className="text-sm text-gray-300">تیکت های بسته</div>
          </div>
          <div className="bg-blue-600/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {state.supportTickets.reduce((total, ticket) => total + ticket.responses.length, 0)}
            </div>
            <div className="text-sm text-gray-300">کل پاسخ ها</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTickets;