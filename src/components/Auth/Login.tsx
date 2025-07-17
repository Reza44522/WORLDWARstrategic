import React, { useState, useEffect } from 'react';
import { LogIn, User, Lock, Moon, Sun, ChevronDown, ChevronUp, Clock, Shield, Antenna as Maintenance, Settings } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

interface LoginProps {
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const { state, dispatch } = useGame();

  // Get system settings from localStorage or default values
  const [systemSettings, setSystemSettings] = useState(() => {
    const saved = localStorage.getItem('systemSettings');
    return saved ? JSON.parse(saved) : {
      isMaintenanceMode: false,
      isSeasonCountdownActive: false,
      seasonStartDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      maintenanceMessage: 'سایت در حال به‌روزرسانی است. لطفاً بعداً تلاش کنید'
    };
  });

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate countdown timer
  useEffect(() => {
    if (systemSettings.isSeasonCountdownActive) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = new Date(systemSettings.seasonStartDate).getTime() - now;

        if (distance > 0) {
          setTimeLeft({
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
          });
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          // Auto-disable countdown when time reaches zero
          const newSettings = { ...systemSettings, isSeasonCountdownActive: false };
          setSystemSettings(newSettings);
          localStorage.setItem('systemSettings', JSON.stringify(newSettings));
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [systemSettings.isSeasonCountdownActive, systemSettings.seasonStartDate]);

  const isAdmin = (user: string) => user === 'ADMIN' || user === 'assistant';
  
  // Check if regular users can access
  const canRegularUsersAccess = () => {
    if (systemSettings.isMaintenanceMode) return false;
    if (systemSettings.isSeasonCountdownActive) {
      return timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;
    }
    return true;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if regular users can access
    if (!isAdmin(username) && !canRegularUsersAccess()) {
      if (systemSettings.isMaintenanceMode) {
        setError('سایت در حال نگهداری است. فقط ادمین‌ها می‌توانند وارد شوند');
      } else {
        setError('سایت هنوز قابل دسترسی نیست. لطفاً تا شروع سیزن صبر کنید');
      }
      return;
    }

    // Admin login
    if (username === 'ADMIN' && password === 'ADMIN786') {
      const adminUser = {
        id: 'admin',
        username: 'مدیر اصلی',
        email: 'admin@worldwar.com',
        resources: { oil: 999999, food: 999999, metals: 999999, weapons: 999999, soldiers: 999999, goods: 999999, aircraft: 999999, tanks: 999999, missiles: 999999, submarines: 999999, electricity: 999999, ships: 999999, defense: 999999 },
        money: 999999,
        role: 'admin' as const,
        createdAt: new Date(),
        lastActive: new Date(),
        isSuspended: false
      };
      dispatch({ type: 'LOGIN', payload: adminUser });
      return;
    }

    // Assistant admin login
    if (username === 'assistant' && password === 'assist789') {
      const assistantUser = {
        id: 'assistant',
        username: 'معاون مدیر',
        email: 'assistant@worldwar.com',
        resources: { oil: 999999, food: 999999, metals: 999999, weapons: 999999, soldiers: 999999, goods: 999999, aircraft: 999999, tanks: 999999, missiles: 999999, submarines: 999999, electricity: 999999, ships: 999999, defense: 999999 },
        money: 999999,
        role: 'assistant' as const,
        createdAt: new Date(),
        lastActive: new Date(),
        isSuspended: false
      };
      dispatch({ type: 'LOGIN', payload: assistantUser });
      return;
    }

    // Regular user login
    const user = state.users.find(u => u.username === username);
    if (user) {
      if (user.isSuspended) {
        setError('حساب شما تعلیق شده است');
        return;
      }
      dispatch({ type: 'LOGIN', payload: { ...user, lastActive: new Date() } });
    } else {
      setError('نام کاربری یا رمز عبور اشتباه است');
    }
  };

  const formatTime = (time: Date) => {
    return time.toLocaleString('fa-IR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const rules = [
    {
      title: "قوانین عمومی",
      items: [
        "احترام به سایر بازیکنان الزامی است",
        "استفاده از زبان نامناسب ممنوع است",
        "هرگونه تقلب منجر به تعلیق حساب می‌شود",
        "اشتراک‌گذاری اطلاعات حساب کاربری ممنوع است"
      ]
    },
    {
      title: "قوانین بازی",
      items: [
        "هر بازیکن فقط می‌تواند یک کشور انتخاب کند",
        "حملات غیرمنصفانه و اسپم ممنوع است",
        "استفاده از ربات یا اسکریپت ممنوع است",
        "معاملات خارج از بازی ممنوع است"
      ]
    },
    {
      title: "مجازات‌ها",
      items: [
        "اخطار اول: هشدار کتبی",
        "اخطار دوم: محدودیت موقت",
        "اخطار سوم: تعلیق دائمی حساب",
        "تقلب: حذف فوری از بازی"
      ]
    }
  ];

  // Show maintenance mode for non-admin users
  if (systemSettings.isMaintenanceMode && !showAdminLogin) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-all duration-500 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <div className={`max-w-md w-full text-center p-8 rounded-2xl shadow-2xl backdrop-blur-lg border transition-all duration-500 ${
          darkMode 
            ? 'bg-white/10 border-white/20 text-white' 
            : 'bg-white/80 border-white/40 text-gray-800'
        }`}>
          <div className="mb-6">
            <Maintenance className="w-16 h-16 mx-auto mb-4 text-orange-500 animate-pulse" />
            <h1 className="text-2xl font-bold mb-2">سایت در حال نگهداری</h1>
            <p className="text-sm opacity-80 mb-4">
              {systemSettings.maintenanceMessage}
            </p>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-6"></div>
          
          {/* Admin Login Access */}
          <button
            onClick={() => setShowAdminLogin(true)}
            className="text-xs text-gray-400 hover:text-gray-300 transition-colors flex items-center space-x-1 mx-auto"
          >
            <Settings className="w-3 h-3" />
            <span>ورود ادمین</span>
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`fixed top-4 right-4 p-2 rounded-xl backdrop-blur-lg border transition-all duration-500 hover:scale-110 ${
            darkMode 
              ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
              : 'bg-white/60 border-white/40 text-gray-800 hover:bg-white/80'
          }`}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    );
  }

  // Show countdown for non-admin users when season countdown is active
  if (systemSettings.isSeasonCountdownActive && !canRegularUsersAccess() && !showAdminLogin) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-all duration-500 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <div className={`max-w-lg w-full text-center p-8 rounded-2xl shadow-2xl backdrop-blur-lg border transition-all duration-500 ${
          darkMode 
            ? 'bg-white/10 border-white/20 text-white' 
            : 'bg-white/80 border-white/40 text-gray-800'
        }`}>
          <div className="mb-6">
            <Clock className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-pulse" />
            <h1 className="text-2xl font-bold mb-2">سیزن جدید به زودی شروع می‌شود</h1>
            <p className="text-sm opacity-80 mb-6">
              لطفاً تا شروع سیزن جدید صبر کنید
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-white/10' : 'bg-white/60'}`}>
              <div className="text-2xl font-bold text-red-500 animate-pulse">{timeLeft.days}</div>
              <div className="text-xs opacity-70">روز</div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-white/10' : 'bg-white/60'}`}>
              <div className="text-2xl font-bold text-orange-500 animate-pulse">{timeLeft.hours}</div>
              <div className="text-xs opacity-70">ساعت</div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-white/10' : 'bg-white/60'}`}>
              <div className="text-2xl font-bold text-yellow-500 animate-pulse">{timeLeft.minutes}</div>
              <div className="text-xs opacity-70">دقیقه</div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-white/10' : 'bg-white/60'}`}>
              <div className="text-2xl font-bold text-green-500 animate-pulse">{timeLeft.seconds}</div>
              <div className="text-xs opacity-70">ثانیه</div>
            </div>
          </div>

          {/* Admin Login Access */}
          <button
            onClick={() => setShowAdminLogin(true)}
            className="text-xs text-gray-400 hover:text-gray-300 transition-colors flex items-center space-x-1 mx-auto"
          >
            <Settings className="w-3 h-3" />
            <span>ورود ادمین</span>
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`fixed top-4 right-4 p-2 rounded-xl backdrop-blur-lg border transition-all duration-500 hover:scale-110 ${
            darkMode 
              ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
              : 'bg-white/60 border-white/40 text-gray-800 hover:bg-white/80'
          }`}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Header with Time Display */}
      <div className="w-full p-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          {/* Real-time Clock */}
          <div className={`px-4 py-2 rounded-xl backdrop-blur-lg border transition-all duration-500 ${
            darkMode 
              ? 'bg-white/10 border-white/20 text-white' 
              : 'bg-white/60 border-white/40 text-gray-800'
          }`}>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                {formatTime(currentTime)}
              </span>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl backdrop-blur-lg border transition-all duration-500 hover:scale-110 ${
              darkMode 
                ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                : 'bg-white/60 border-white/40 text-gray-800 hover:bg-white/80'
            }`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Admin Access Notice */}
          {showAdminLogin && (systemSettings.isMaintenanceMode || systemSettings.isSeasonCountdownActive) && (
            <div className={`mb-6 p-4 rounded-2xl backdrop-blur-lg border transition-all duration-500 ${
              darkMode 
                ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30' 
                : 'bg-gradient-to-r from-red-100 to-orange-100 border-red-200'
            }`}>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-red-500" />
                <h3 className={`text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  دسترسی ویژه ادمین
                </h3>
                <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  شما در حال ورود با دسترسی ادمین هستید
                </p>
                <button
                  onClick={() => setShowAdminLogin(false)}
                  className="text-xs text-blue-400 hover:text-blue-300 mt-2"
                >
                  بازگشت به صفحه عادی
                </button>
              </div>
            </div>
          )}

          {/* Countdown Timer for Admins */}
          {systemSettings.isSeasonCountdownActive && (showAdminLogin || isAdmin(username)) && (
            <div className={`mb-6 p-6 rounded-2xl backdrop-blur-lg border transition-all duration-500 ${
              darkMode 
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30' 
                : 'bg-gradient-to-r from-blue-100 to-purple-100 border-blue-200'
            }`}>
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto mb-3 text-blue-500 animate-pulse" />
                <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  تایمر سیزن جدید
                </h3>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-white/10' : 'bg-white/60'}`}>
                    <div className="text-2xl font-bold text-red-500">{timeLeft.days}</div>
                    <div className="text-xs opacity-70">روز</div>
                  </div>
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-white/10' : 'bg-white/60'}`}>
                    <div className="text-2xl font-bold text-orange-500">{timeLeft.hours}</div>
                    <div className="text-xs opacity-70">ساعت</div>
                  </div>
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-white/10' : 'bg-white/60'}`}>
                    <div className="text-2xl font-bold text-yellow-500">{timeLeft.minutes}</div>
                    <div className="text-xs opacity-70">دقیقه</div>
                  </div>
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-white/10' : 'bg-white/60'}`}>
                    <div className="text-2xl font-bold text-green-500 animate-pulse">{timeLeft.seconds}</div>
                    <div className="text-xs opacity-70">ثانیه</div>
                  </div>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  تا شروع سیزن عمومی
                </p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <div className={`backdrop-blur-lg rounded-2xl shadow-2xl border transition-all duration-500 ${
            darkMode 
              ? 'bg-white/10 border-white/20' 
              : 'bg-white/80 border-white/40'
          }`}>
            <div className="p-8">
              <div className="text-center mb-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                    : 'bg-gradient-to-r from-blue-400 to-purple-400'
                }`}>
                  <LogIn className="w-8 h-8 text-white" />
                </div>
                <h1 className={`text-3xl font-bold mb-2 transition-colors duration-500 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  ورود به بازی
                </h1>
                <p className={`transition-colors duration-500 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  World War Strategy Game
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      نام کاربری
                    </label>
                    <div className="relative">
                      <User className={`absolute right-3 top-3 w-5 h-5 transition-colors duration-500 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={`w-full pr-10 pl-4 py-3 rounded-lg border transition-all duration-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          darkMode 
                            ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' 
                            : 'bg-white/60 border-gray-300 text-gray-800 placeholder-gray-500'
                        }`}
                        placeholder="نام کاربری خود را وارد کنید"
                        required
                        dir="rtl"
                        disabled={!canRegularUsersAccess() && !showAdminLogin}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      رمز عبور
                    </label>
                    <div className="relative">
                      <Lock className={`absolute right-3 top-3 w-5 h-5 transition-colors duration-500 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pr-10 pl-4 py-3 rounded-lg border transition-all duration-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          darkMode 
                            ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' 
                            : 'bg-white/60 border-gray-300 text-gray-800 placeholder-gray-500'
                        }`}
                        placeholder="رمز عبور خود را وارد کنید"
                        required
                        dir="rtl"
                        disabled={!canRegularUsersAccess() && !showAdminLogin}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className={`p-3 rounded-lg border transition-all duration-500 ${
                    darkMode 
                      ? 'bg-red-500/20 border-red-500/30 text-red-300' 
                      : 'bg-red-50 border-red-200 text-red-600'
                  }`}>
                    <p className="text-sm text-center" dir="rtl">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canRegularUsersAccess() && !showAdminLogin}
                  className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-500 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                    darkMode 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  ورود
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className={`transition-colors duration-500 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`} dir="rtl">
                  حساب کاربری ندارید؟{' '}
                  <button
                    onClick={onSwitchToRegister}
                    disabled={!canRegularUsersAccess()}
                    className={`font-medium transition-colors duration-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed ${
                      darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    ثبت نام کنید
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Rules Section */}
          <div className={`mt-6 backdrop-blur-lg rounded-2xl border transition-all duration-500 ${
            darkMode 
              ? 'bg-white/10 border-white/20' 
              : 'bg-white/80 border-white/40'
          }`}>
            <button
              onClick={() => setShowRules(!showRules)}
              className={`w-full p-4 flex items-center justify-between transition-colors duration-500 hover:bg-white/10 rounded-2xl ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}
            >
              <span className="font-medium">قوانین و مقررات</span>
              {showRules ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {showRules && (
              <div className="px-4 pb-4 space-y-4 animate-in slide-in-from-top duration-300">
                {rules.map((section, index) => (
                  <div key={index} className={`p-4 rounded-lg transition-all duration-500 ${
                    darkMode ? 'bg-white/5' : 'bg-white/40'
                  }`}>
                    <h3 className={`font-bold mb-3 transition-colors duration-500 ${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`} dir="rtl">
                      {section.title}
                    </h3>
                    <ul className="space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className={`text-sm flex items-start space-x-2 transition-colors duration-500 ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`} dir="rtl">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`w-full p-4 text-center transition-all duration-500 ${
        darkMode 
          ? 'bg-black/20 text-gray-300 border-t border-white/10' 
          : 'bg-white/20 text-gray-600 border-t border-gray-200'
      }`}>
        <p className="text-sm font-medium">
          ساخته شده توسط تیم Hybris. هرگونه کپی‌برداری غیرمجاز ممنوع بوده و با متخلفان برخورد خواهد شد
        </p>
      </footer>
    </div>
  );
};

export default Login;