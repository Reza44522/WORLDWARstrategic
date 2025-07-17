import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { Crown, Users, Zap, Eye, Settings } from 'lucide-react';

const AdminMap: React.FC = () => {
  const { state } = useGame();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const handleCountryClick = (countryId: string) => {
    setSelectedCountry(countryId);
  };

  const selectedCountryData = selectedCountry 
    ? state.countries.find(c => c.id === selectedCountry) 
    : null;

  const occupyingUser = selectedCountryData?.occupiedBy
    ? state.users.find(u => u.id === selectedCountryData.occupiedBy)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white" dir="rtl">نقشه مدیریت</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-300" dir="rtl">
          <Eye className="w-4 h-4" />
          <span>نظارت بر تمام فعالیت‌های بازیکنان</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map */}
        <div className="xl:col-span-2">
          <div className="relative w-full h-[500px] bg-gradient-to-b from-blue-200 to-green-200 rounded-xl overflow-hidden shadow-2xl">
            {/* World Map Background */}
            <div className="absolute inset-0 bg-blue-100">
              <svg className="w-full h-full" viewBox="0 0 100 80">
                {/* Continents */}
                <path
                  d="M15 20 Q25 15 35 25 Q45 20 50 30 L40 40 Q30 45 20 35 Z"
                  fill="#22c55e"
                  opacity="0.7"
                />
                <path
                  d="M40 15 Q60 10 70 25 Q80 20 85 35 L75 45 Q65 50 55 40 Q45 35 40 25 Z"
                  fill="#22c55e"
                  opacity="0.7"
                />
                <path
                  d="M10 50 Q20 45 30 55 Q40 60 35 70 L25 75 Q15 70 10 60 Z"
                  fill="#22c55e"
                  opacity="0.7"
                />
                <path
                  d="M65 50 Q75 45 85 55 Q90 60 85 70 L75 75 Q70 70 65 60 Z"
                  fill="#22c55e"
                  opacity="0.7"
                />
              </svg>
            </div>

            {/* Countries */}
            {state.countries.map((country) => (
              <div
                key={country.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-110 ${
                  selectedCountry === country.id ? 'ring-4 ring-yellow-400 scale-110' : ''
                }`}
                style={{
                  left: `${country.position.x}%`,
                  top: `${country.position.y}%`
                }}
                onClick={() => handleCountryClick(country.id)}
              >
                <div className={`relative p-3 rounded-lg border-2 shadow-lg ${
                  country.isOccupied
                    ? 'bg-red-500 border-red-700'
                    : 'bg-gray-300 border-gray-500'
                }`}>
                  <div className="text-2xl mb-1">{country.flag}</div>
                  <div className="text-xs font-bold text-center whitespace-nowrap text-white">
                    {country.name}
                  </div>
                  <div className="flex items-center justify-center mt-1 space-x-1">
                    <Zap className="w-3 h-3 text-yellow-300" />
                    <span className="text-xs text-white">{country.power}</span>
                  </div>
                  {country.isOccupied && (
                    <div className="absolute -top-2 -right-2">
                      <Crown className="w-4 h-4 text-yellow-400" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Admin Legend */}
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white">
              <h3 className="font-bold text-sm mb-2" dir="rtl">راهنمای مدیر:</h3>
              <div className="space-y-1 text-xs" dir="rtl">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 border-2 border-red-700 rounded"></div>
                  <span>اشغال شده</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-300 border-2 border-gray-500 rounded"></div>
                  <span>آزاد</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span>دارای بازیکن</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Country Details */}
        <div className="space-y-4">
          {selectedCountryData ? (
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{selectedCountryData.flag}</div>
                <h3 className="text-xl font-bold text-white" dir="rtl">
                  {selectedCountryData.name}
                </h3>
              </div>

              {occupyingUser ? (
                <div className="space-y-4">
                  <div className="bg-green-600/20 rounded-lg p-4">
                    <h4 className="font-bold text-green-400 mb-2" dir="rtl">بازیکن کنترل‌کننده:</h4>
                    <div className="text-white">
                      <div className="font-bold">{occupyingUser.username}</div>
                      <div className="text-sm text-gray-300">{occupyingUser.email}</div>
                      <div className="text-sm text-gray-300">
                        آخرین فعالیت: {new Date(occupyingUser.lastActive).toLocaleString('fa-IR')}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-600/20 rounded-lg p-4">
                    <h4 className="font-bold text-blue-400 mb-2" dir="rtl">منابع بازیکن:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-white">
                      <div>نفت: {occupyingUser.resources.oil.toLocaleString()}</div>
                      <div>غذا: {occupyingUser.resources.food.toLocaleString()}</div>
                      <div>فلز: {occupyingUser.resources.metals.toLocaleString()}</div>
                      <div>سلاح: {occupyingUser.resources.weapons.toLocaleString()}</div>
                      <div className="col-span-2">
                        سرباز: {occupyingUser.resources.soldiers.toLocaleString()}
                      </div>
                      <div className="col-span-2 pt-2 border-t border-gray-600">
                        دلار جنگ: {occupyingUser.money.toLocaleString()} WD
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-600/20 rounded-lg p-4 text-center">
                  <h4 className="font-bold text-gray-400" dir="rtl">کشور آزاد</h4>
                  <p className="text-sm text-gray-500 mt-2" dir="rtl">
                    این کشور هنوز توسط هیچ بازیکنی انتخاب نشده است
                  </p>
                </div>
              )}

              <div className="bg-yellow-600/20 rounded-lg p-4 mt-4">
                <h4 className="font-bold text-yellow-400 mb-2" dir="rtl">مشخصات کشور:</h4>
                <div className="text-sm text-white space-y-1">
                  <div>قدرت: {selectedCountryData.power}</div>
                  <div>منابع اولیه نفت: {selectedCountryData.resources.oil.toLocaleString()}</div>
                  <div>منابع اولیه غذا: {selectedCountryData.resources.food.toLocaleString()}</div>
                  <div>ارتش اولیه: {selectedCountryData.resources.soldiers.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 rounded-lg p-6 text-center">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2" dir="rtl">انتخاب کشور</h3>
              <p className="text-gray-400 text-sm" dir="rtl">
                روی هر کشور کلیک کنید تا جزئیات آن را مشاهده کنید
              </p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-bold text-white mb-3" dir="rtl">عملیات سریع:</h4>
            <div className="space-y-2">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors text-sm">
                مشاهده تمام اتحادها
              </button>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors text-sm">
                مشاهده جنگ‌های فعال
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors text-sm">
                گزارش فعالیت‌های اخیر
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMap;