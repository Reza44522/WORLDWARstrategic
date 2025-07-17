import React, { useState, useEffect } from 'react';
import { UserPlus, User, Mail, Lock, Moon, Sun, Clock } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { state, dispatch } = useGame();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('رمز عبور و تکرار آن یکسان نیستند');
      return;
    }

    if (formData.password.length < 6) {
      setError('رمز عبور باید حداقل 6 کاراکتر باشد');
      return;
    }

    // Check if username already exists
    if (state.users.some(u => u.username === formData.username)) {
      setError('این نام کاربری قبلاً استفاده شده است');
      return;
    }

    // Check if email already exists
    if (state.users.some(u => u.email === formData.email)) {
      setError('این ایمیل قبلاً استفاده شده است');
      return;
    }

    // Check max players limit
    if (state.users.length >= state.gameSettings.maxPlayers) {
      setError('حداکثر تعداد بازیکنان (15 نفر) تکمیل شده است');
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username: formData.username,
      email: formData.email,
      resources: state.gameSettings.initialResources,
      money: state.gameSettings.initialMoney,
      role: 'player' as const,
      createdAt: new Date(),
      lastActive: new Date(),
      isSuspended: false
    };

    dispatch({ type: 'REGISTER', payload: newUser });
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
          <div className={`backdrop-blur-lg rounded-2xl shadow-2xl border transition-all duration-500 ${
            darkMode 
              ? 'bg-white/10 border-white/20' 
              : 'bg-white/80 border-white/40'
          }`}>
            <div className="p-8">
              <div className="text-center mb-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                    : 'bg-gradient-to-r from-green-400 to-blue-400'
                }`}>
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h1 className={`text-3xl font-bold mb-2 transition-colors duration-500 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  ثبت نام
                </h1>
                <p className={`transition-colors duration-500 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  به جنگ جهانی بپیوندید
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
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
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={`w-full pr-10 pl-4 py-3 rounded-lg border transition-all duration-500 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          darkMode 
                            ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' 
                            : 'bg-white/60 border-gray-300 text-gray-800 placeholder-gray-500'
                        }`}
                        placeholder="نام کاربری مورد نظر"
                        required
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      ایمیل
                    </label>
                    <div className="relative">
                      <Mail className={`absolute right-3 top-3 w-5 h-5 transition-colors duration-500 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pr-10 pl-4 py-3 rounded-lg border transition-all duration-500 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          darkMode 
                            ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' 
                            : 'bg-white/60 border-gray-300 text-gray-800 placeholder-gray-500'
                        }`}
                        placeholder="آدرس ایمیل"
                        required
                        dir="ltr"
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
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pr-10 pl-4 py-3 rounded-lg border transition-all duration-500 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          darkMode 
                            ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' 
                            : 'bg-white/60 border-gray-300 text-gray-800 placeholder-gray-500'
                        }`}
                        placeholder="رمز عبور (حداقل 6 کاراکتر)"
                        required
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      تکرار رمز عبور
                    </label>
                    <div className="relative">
                      <Lock className={`absolute right-3 top-3 w-5 h-5 transition-colors duration-500 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full pr-10 pl-4 py-3 rounded-lg border transition-all duration-500 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          darkMode 
                            ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' 
                            : 'bg-white/60 border-gray-300 text-gray-800 placeholder-gray-500'
                        }`}
                        placeholder="تکرار رمز عبور"
                        required
                        dir="rtl"
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
                  className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-500 transform hover:scale-105 ${
                    darkMode 
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  ثبت نام
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className={`transition-colors duration-500 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`} dir="rtl">
                  حساب کاربری دارید؟{' '}
                  <button
                    onClick={onSwitchToLogin}
                    className={`font-medium transition-colors duration-500 hover:underline ${
                      darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'
                    }`}
                  >
                    وارد شوید
                  </button>
                </p>
              </div>

              <div className={`mt-6 p-4 rounded-lg border transition-all duration-500 ${
                darkMode 
                  ? 'bg-yellow-500/20 border-yellow-500/30' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <p className={`text-sm text-center transition-colors duration-500 ${
                  darkMode ? 'text-yellow-300' : 'text-yellow-800'
                }`} dir="rtl">
                  ظرفیت بازی: {state.users.length} / {state.gameSettings.maxPlayers} بازیکن
                </p>
              </div>
            </div>
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

export default Register;