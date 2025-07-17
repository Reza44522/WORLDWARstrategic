import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { Ban, CheckCircle, Crown, AlertTriangle, Mail, Calendar, UserMinus, UserPlus, Volume2, VolumeX, Clock, Flag } from 'lucide-react';

const UserManagement: React.FC = () => {
  const { state, dispatch } = useGame();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [muteMinutes, setMuteMinutes] = useState(30);
  const [timeoutMinutes, setTimeoutMinutes] = useState(60);

  const players = state.users.filter(u => u.role === 'player' || u.role === 'assistant');

  const handleSuspendUser = (userId: string) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این کاربر را تعلیق کنید؟')) {
      const updatedUsers = state.users.map(u => 
        u.id === userId ? { ...u, isSuspended: true } : u
      );
      dispatch({ type: 'LOAD_DATA', payload: { users: updatedUsers } });
    }
  };

  const handleUnsuspendUser = (userId: string) => {
    const updatedUsers = state.users.map(u => 
      u.id === userId ? { ...u, isSuspended: false } : u
    );
    dispatch({ type: 'LOAD_DATA', payload: { users: updatedUsers } });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟ این عمل قابل بازگشت نیست.')) {
      const updatedUsers = state.users.filter(u => u.id !== userId);
      const updatedCountries = state.countries.map(c => 
        c.occupiedBy === userId ? { ...c, isOccupied: false, occupiedBy: undefined } : c
      );
      dispatch({ type: 'LOAD_DATA', payload: { users: updatedUsers, countries: updatedCountries } });
    }
  };

  const handlePromoteToAssistant = (userId: string) => {
    if (confirm('آیا می‌خواهید این بازیکن را به معاون ارتقا دهید؟')) {
      dispatch({ type: 'PROMOTE_TO_ASSISTANT', payload: { userId } });
    }
  };

  const handleDemoteFromAssistant = (userId: string) => {
    if (confirm('آیا می‌خواهید این معاون را به بازیکن عادی تبدیل کنید؟')) {
      dispatch({ type: 'DEMOTE_FROM_ASSISTANT', payload: { userId } });
    }
  };

  const handleMuteUser = (userId: string) => {
    if (confirm(`آیا می‌خواهید این کاربر را برای ${muteMinutes} دقیقه میوت کنید؟`)) {
      dispatch({ type: 'MUTE_USER', payload: { userId, duration: muteMinutes } });
    }
  };

  const handleUnmuteUser = (userId: string) => {
    dispatch({ type: 'UNMUTE_USER', payload: { userId } });
  };

  const handleTimeoutUser = (userId: string) => {
    if (confirm(`آیا می‌خواهید این کاربر را برای ${timeoutMinutes} دقیقه تایم‌اوت کنید؟`)) {
      dispatch({ type: 'TIMEOUT_USER', payload: { userId, duration: timeoutMinutes } });
    }
  };

  const handleRemoveTimeout = (userId: string) => {
    dispatch({ type: 'REMOVE_TIMEOUT', payload: { userId } });
  };

  const handleRemoveFromCountry = (userId: string) => {
    if (confirm('آیا می‌خواهید این بازیکن را از کشورش حذف کنید؟')) {
      dispatch({ type: 'REMOVE_PLAYER_FROM_COUNTRY', payload: { userId } });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white" dir="rtl">مدیریت کاربران</h2>
        <div className="text-sm text-gray-300" dir="rtl">
          تعداد کل: {players.length} کاربر
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white/10 rounded-lg p-4">
        <h3 className="font-bold text-white mb-3" dir="rtl">تنظیمات کنترل:</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" dir="rtl">
              مدت میوت (دقیقه):
            </label>
            <input
              type="number"
              value={muteMinutes}
              onChange={(e) => setMuteMinutes(parseInt(e.target.value) || 30)}
              min="1"
              max="1440"
              className="w-full bg-white/10 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" dir="rtl">
              مدت تایم‌اوت (دقیقه):
            </label>
            <input
              type="number"
              value={timeoutMinutes}
              onChange={(e) => setTimeoutMinutes(parseInt(e.target.value) || 60)}
              min="1"
              max="10080"
              className="w-full bg-white/10 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="xl:col-span-2">
          <div className="bg-white/10 rounded-lg overflow-hidden">
            <div className="bg-white/20 p-4 border-b border-gray-600">
              <h3 className="font-bold text-white" dir="rtl">لیست کاربران</h3>
            </div>
            <div className="divide-y divide-gray-600 max-h-[600px] overflow-y-auto">
              {players.map((user) => {
                const userCountry = user.country ? state.countries.find(c => c.id === user.country) : null;
                
                return (
                  <div
                    key={user.id}
                    className={`p-4 hover:bg-white/5 cursor-pointer transition-colors ${
                      selectedUser === user.id ? 'bg-blue-500/20' : ''
                    }`}
                    onClick={() => setSelectedUser(user.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3" dir="rtl">
                        {userCountry && (
                          <span className="text-2xl">{userCountry.flag}</span>
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-white">{user.username}</h4>
                            {user.role === 'assistant' && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                            {user.isSuspended && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                            {user.isMuted && (
                              <VolumeX className="w-4 h-4 text-orange-500" />
                            )}
                            {user.isTimedOut && (
                              <Clock className="w-4 h-4 text-purple-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                          {userCountry && (
                            <div className="text-sm text-blue-400">{userCountry.name}</div>
                          )}
                          {user.role === 'assistant' && (
                            <div className="text-xs text-yellow-400">معاون مدیر</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-400 text-left">
                          <div>WD: {user.money.toLocaleString()}</div>
                          <div>سرباز: {user.resources.soldiers.toLocaleString()}</div>
                        </div>
                        
                        <div className="flex flex-col space-y-1">
                          {/* Quick Actions */}
                          {user.role === 'player' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePromoteToAssistant(user.id);
                              }}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white p-1 rounded text-xs"
                              title="ارتقا به معاون"
                            >
                              <UserPlus className="w-3 h-3" />
                            </button>
                          ) : user.role === 'assistant' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDemoteFromAssistant(user.id);
                              }}
                              className="bg-orange-600 hover:bg-orange-700 text-white p-1 rounded text-xs"
                              title="تنزل به بازیکن"
                            >
                              <UserMinus className="w-3 h-3" />
                            </button>
                          )}
                          
                          {user.isMuted ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnmuteUser(user.id);
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white p-1 rounded text-xs"
                              title="رفع میوت"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMuteUser(user.id);
                              }}
                              className="bg-orange-600 hover:bg-orange-700 text-white p-1 rounded text-xs"
                              title="میوت"
                            >
                              <VolumeX className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Details */}
        <div>
          {selectedUser ? (
            <div className="bg-white/10 rounded-lg p-6">
              {(() => {
                const user = players.find(u => u.id === selectedUser);
                const userCountry = user?.country ? state.countries.find(c => c.id === user.country) : null;
                
                if (!user) return null;
                
                return (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Crown className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{user.username}</h3>
                      <p className="text-gray-400">{user.email}</p>
                      {user.role === 'assistant' && (
                        <div className="text-yellow-400 text-sm font-bold">معاون مدیر</div>
                      )}
                    </div>

                    {userCountry && (
                      <div className="bg-green-600/20 rounded-lg p-4 text-center">
                        <div className="text-3xl mb-2">{userCountry.flag}</div>
                        <div className="font-bold text-white">{userCountry.name}</div>
                        <div className="text-sm text-gray-300">قدرت: {userCountry.power}</div>
                      </div>
                    )}

                    {/* Status Indicators */}
                    <div className="space-y-2">
                      {user.isSuspended && (
                        <div className="bg-red-600/20 rounded-lg p-2 text-center">
                          <span className="text-red-400 font-bold text-sm">تعلیق شده</span>
                        </div>
                      )}
                      {user.isMuted && (
                        <div className="bg-orange-600/20 rounded-lg p-2 text-center">
                          <span className="text-orange-400 font-bold text-sm">
                            میوت شده {user.muteExpiresAt && `تا ${new Date(user.muteExpiresAt).toLocaleString('fa-IR')}`}
                          </span>
                        </div>
                      )}
                      {user.isTimedOut && (
                        <div className="bg-purple-600/20 rounded-lg p-2 text-center">
                          <span className="text-purple-400 font-bold text-sm">
                            تایم‌اوت {user.timeoutExpiresAt && `تا ${new Date(user.timeoutExpiresAt).toLocaleString('fa-IR')}`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-600/20 rounded-lg p-4">
                      <h4 className="font-bold text-blue-400 mb-2" dir="rtl">منابع:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-white">
                        <div>نفت: {user.resources.oil.toLocaleString()}</div>
                        <div>غذا: {user.resources.food.toLocaleString()}</div>
                        <div>فلز: {user.resources.metals.toLocaleString()}</div>
                        <div>سلاح: {user.resources.weapons.toLocaleString()}</div>
                        <div>سرباز: {user.resources.soldiers.toLocaleString()}</div>
                        <div>کالا: {user.resources.goods.toLocaleString()}</div>
                        <div>هواپیما: {user.resources.aircraft.toLocaleString()}</div>
                        <div>تانک: {user.resources.tanks.toLocaleString()}</div>
                        <div>موشک: {user.resources.missiles.toLocaleString()}</div>
                        <div>زیردریایی: {user.resources.submarines.toLocaleString()}</div>
                        <div>برق: {user.resources.electricity.toLocaleString()}</div>
                        <div>کشتی: {user.resources.ships.toLocaleString()}</div>
                        <div className="col-span-2 pt-2 border-t border-gray-600">
                          دلار جنگ: {user.money.toLocaleString()} WD
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-600/20 rounded-lg p-4">
                      <h4 className="font-bold text-gray-400 mb-2" dir="rtl">اطلاعات حساب:</h4>
                      <div className="space-y-2 text-sm text-white">
                        <div className="flex items-center space-x-2" dir="rtl">
                          <Calendar className="w-4 h-4" />
                          <span>عضویت: {new Date(user.createdAt).toLocaleDateString('fa-IR')}</span>
                        </div>
                        <div className="flex items-center space-x-2" dir="rtl">
                          <Mail className="w-4 h-4" />
                          <span>آخرین فعالیت: {new Date(user.lastActive).toLocaleString('fa-IR')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {/* Role Management */}
                      {user.role === 'player' ? (
                        <button
                          onClick={() => handlePromoteToAssistant(user.id)}
                          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded transition-colors"
                        >
                          ارتقا به معاون
                        </button>
                      ) : user.role === 'assistant' && (
                        <button
                          onClick={() => handleDemoteFromAssistant(user.id)}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded transition-colors"
                        >
                          تنزل به بازیکن
                        </button>
                      )}

                      {/* Mute/Unmute */}
                      {user.isMuted ? (
                        <button
                          onClick={() => handleUnmuteUser(user.id)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
                        >
                          رفع میوت
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMuteUser(user.id)}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded transition-colors"
                        >
                          میوت کاربر
                        </button>
                      )}

                      {/* Timeout */}
                      {user.isTimedOut ? (
                        <button
                          onClick={() => handleRemoveTimeout(user.id)}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
                        >
                          رفع تایم‌اوت
                        </button>
                      ) : (
                        <button
                          onClick={() => handleTimeoutUser(user.id)}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
                        >
                          تایم‌اوت کاربر
                        </button>
                      )}

                      {/* Suspend/Unsuspend */}
                      {user.isSuspended ? (
                        <button
                          onClick={() => handleUnsuspendUser(user.id)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
                        >
                          رفع تعلیق
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspendUser(user.id)}
                          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded transition-colors"
                        >
                          تعلیق کاربر
                        </button>
                      )}

                      {/* Remove from Country */}
                      {userCountry && (
                        <button
                          onClick={() => handleRemoveFromCountry(user.id)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
                        >
                          حذف از کشور
                        </button>
                      )}
                      
                      {/* Delete User */}
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="w-full bg-red-800 hover:bg-red-900 text-white py-2 px-4 rounded transition-colors"
                      >
                        حذف کاربر
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white/10 rounded-lg p-6 text-center">
              <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2" dir="rtl">انتخاب کاربر</h3>
              <p className="text-gray-400 text-sm" dir="rtl">
                روی هر کاربر کلیک کنید تا جزئیات آن را مشاهده کنید
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Reports Section */}
      <div className="bg-white/10 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2" dir="rtl">
          <Flag className="w-6 h-6" />
          <span>گزارشات کاربران</span>
        </h3>
        
        <div className="space-y-3">
          {state.userReports
            .filter(report => report.status === 'pending')
            .map(report => (
              <div key={report.id} className="bg-red-600/20 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-white" dir="rtl">
                      گزارش {report.reportedUserName}
                    </div>
                    <div className="text-sm text-gray-300" dir="rtl">
                      توسط: {report.reporterName}
                    </div>
                    <div className="text-sm text-red-400" dir="rtl">
                      دلیل: {report.reason}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(report.createdAt).toLocaleString('fa-IR')}
                  </div>
                </div>
                
                <div className="bg-white/10 rounded p-2 mb-3">
                  <div className="text-white text-sm" dir="rtl">{report.description}</div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => dispatch({ 
                      type: 'RESOLVE_USER_REPORT', 
                      payload: { 
                        reportId: report.id, 
                        status: 'dismissed', 
                        resolvedBy: state.currentUser?.id || '' 
                      } 
                    })}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
                  >
                    رد گزارش
                  </button>
                  <button
                    onClick={() => {
                      dispatch({ 
                        type: 'RESOLVE_USER_REPORT', 
                        payload: { 
                          reportId: report.id, 
                          status: 'resolved', 
                          resolvedBy: state.currentUser?.id || '' 
                        } 
                      });
                      // Auto-suspend the reported user
                      handleSuspendUser(report.reportedUserId);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
                  >
                    تأیید و تعلیق
                  </button>
                </div>
              </div>
            ))}
          
          {state.userReports.filter(r => r.status === 'pending').length === 0 && (
            <div className="text-center text-gray-400 py-4" dir="rtl">
              <Flag className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>گزارش جدیدی وجود ندارد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;