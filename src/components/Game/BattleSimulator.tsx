import React, { useState, useEffect } from 'react';
import { Swords, Calculator, Trophy, AlertTriangle } from 'lucide-react';

interface Equipment {
  tanks: number;
  planes: number;
  soldiers: number;
  missiles: number;
  submarines: number;
  ships: number;
}

interface CountryLimits {
  [key: string]: Equipment;
}

const BattleSimulator: React.FC = () => {
  const [country1, setCountry1] = useState('');
  const [country2, setCountry2] = useState('');
  const [equipment1, setEquipment1] = useState<Equipment>({
    tanks: 0, planes: 0, soldiers: 0, missiles: 0, submarines: 0, ships: 0
  });
  const [equipment2, setEquipment2] = useState<Equipment>({
    tanks: 0, planes: 0, soldiers: 0, missiles: 0, submarines: 0, ships: 0
  });
  const [results, setResults] = useState<any>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const countryLimits: CountryLimits = {
    germany: { tanks: 100, planes: 50, soldiers: 1000, missiles: 20, submarines: 10, ships: 10 },
    italy: { tanks: 50, planes: 30, soldiers: 800, missiles: 10, submarines: 5, ships: 5 },
    japan: { tanks: 70, planes: 60, soldiers: 900, missiles: 25, submarines: 10, ships: 8 },
    hungary: { tanks: 30, planes: 20, soldiers: 500, missiles: 5, submarines: 2, ships: 2 },
    romania: { tanks: 30, planes: 20, soldiers: 500, missiles: 5, submarines: 2, ships: 2 },
    bulgaria: { tanks: 30, planes: 20, soldiers: 500, missiles: 5, submarines: 2, ships: 2 },
    finland: { tanks: 30, planes: 20, soldiers: 500, missiles: 5, submarines: 2, ships: 2 },
    uk: { tanks: 80, planes: 70, soldiers: 1000, missiles: 30, submarines: 10, ships: 12 },
    france: { tanks: 40, planes: 30, soldiers: 600, missiles: 15, submarines: 5, ships: 4 },
    ussr: { tanks: 120, planes: 40, soldiers: 1500, missiles: 40, submarines: 12, ships: 15 },
    usa: { tanks: 90, planes: 80, soldiers: 1000, missiles: 50, submarines: 20, ships: 20 },
    china: { tanks: 30, planes: 20, soldiers: 1200, missiles: 10, submarines: 4, ships: 3 },
    canada: { tanks: 40, planes: 30, soldiers: 600, missiles: 10, submarines: 3, ships: 3 },
    australia: { tanks: 40, planes: 30, soldiers: 600, missiles: 10, submarines: 3, ships: 3 },
    newzealand: { tanks: 40, planes: 30, soldiers: 600, missiles: 10, submarines: 3, ships: 3 },
    india: { tanks: 20, planes: 15, soldiers: 1000, missiles: 5, submarines: 2, ships: 1 },
    poland: { tanks: 20, planes: 15, soldiers: 500, missiles: 5, submarines: 1, ships: 1 },
    greece: { tanks: 20, planes: 15, soldiers: 500, missiles: 5, submarines: 1, ships: 1 },
    netherlands: { tanks: 20, planes: 15, soldiers: 500, missiles: 5, submarines: 1, ships: 1 },
    belgium: { tanks: 20, planes: 15, soldiers: 500, missiles: 5, submarines: 1, ships: 1 },
    norway: { tanks: 20, planes: 15, soldiers: 500, missiles: 5, submarines: 1, ships: 1 },
    brazil: { tanks: 30, planes: 20, soldiers: 600, missiles: 7, submarines: 2, ships: 2 },
    iran: { tanks: 20, planes: 10, soldiers: 400, missiles: 4, submarines: 1, ships: 1 },
    turkey: { tanks: 15, planes: 10, soldiers: 300, missiles: 3, submarines: 1, ships: 1 },
    spain: { tanks: 15, planes: 10, soldiers: 300, missiles: 3, submarines: 1, ships: 1 },
    portugal: { tanks: 15, planes: 10, soldiers: 300, missiles: 3, submarines: 1, ships: 1 },
    switzerland: { tanks: 15, planes: 10, soldiers: 300, missiles: 3, submarines: 1, ships: 1 },
    argentina: { tanks: 15, planes: 10, soldiers: 300, missiles: 3, submarines: 1, ships: 1 },
    sweden: { tanks: 15, planes: 10, soldiers: 300, missiles: 3, submarines: 1, ships: 1 },
    afghanistan: { tanks: 15, planes: 10, soldiers: 300, missiles: 3, submarines: 1, ships: 1 },
    saudi: { tanks: 15, planes: 10, soldiers: 300, missiles: 3, submarines: 1, ships: 1 }
  };

  const countryNames: {[key: string]: string} = {
    germany: '🇩🇪 آلمان نازی',
    italy: '🇮🇹 ایتالیا',
    japan: '🇯🇵 ژاپن',
    hungary: '🇭🇺 مجارستان',
    romania: '🇷🇴 رومانی',
    bulgaria: '🇧🇬 بلغارستان',
    finland: '🇫🇮 فنلاند',
    uk: '🇬🇧 بریتانیا',
    france: '🇫🇷 فرانسه',
    ussr: '🚩 شوروی',
    usa: '🇺🇸 آمریکا',
    china: '🇨🇳 چین',
    canada: '🇨🇦 کانادا',
    australia: '🇦🇺 استرالیا',
    newzealand: '🇳🇿 نیوزلند',
    india: '🇮🇳 هند',
    poland: '🇵🇱 لهستان',
    greece: '🇬🇷 یونان',
    netherlands: '🇳🇱 هلند',
    belgium: '🇧🇪 بلژیک',
    norway: '🇳🇴 نروژ',
    brazil: '🇧🇷 برزیل',
    iran: '🇮🇷 ایران',
    turkey: '🇹🇷 ترکیه',
    spain: '🇪🇸 اسپانیا',
    portugal: '🇵🇹 پرتغال',
    switzerland: '🇨🇭 سوئیس',
    argentina: '🇦🇷 آرژانتین',
    sweden: '🇸🇪 سوئد',
    afghanistan: '🇦🇫 افغانستان',
    saudi: '🇸🇦 عربستان'
  };

  const equipmentNames = {
    tanks: 'تانک',
    planes: 'هواپیما',
    soldiers: 'سرباز',
    missiles: 'موشک',
    submarines: 'زیردریایی',
    ships: 'ناو جنگی'
  };

  const countries = [
    { group: 'محور', countries: ['germany', 'italy', 'japan', 'hungary', 'romania', 'bulgaria', 'finland'] },
    { group: 'متفقین', countries: ['uk', 'france', 'ussr', 'usa', 'china', 'canada', 'australia', 'newzealand', 'india', 'poland', 'greece', 'netherlands', 'belgium', 'norway', 'brazil'] },
    { group: 'بی‌طرف', countries: ['iran', 'turkey', 'spain', 'portugal', 'switzerland', 'argentina', 'sweden', 'afghanistan', 'saudi'] }
  ];

  const validateEquipment = (countryId: string, equipmentType: keyof Equipment, value: number): string | null => {
    const limits = countryLimits[countryId];
    if (!limits) return null;
    
    const limit = limits[equipmentType];
    if (value > limit) {
      return `حداکثر ${equipmentNames[equipmentType]} برای ${countryNames[countryId]}: ${limit}`;
    }
    return null;
  };

  const handleEquipmentChange = (country: 1 | 2, equipmentType: keyof Equipment, value: number) => {
    const countryId = country === 1 ? country1 : country2;
    const equipment = country === 1 ? equipment1 : equipment2;
    const setEquipment = country === 1 ? setEquipment1 : setEquipment2;
    
    const newEquipment = { ...equipment, [equipmentType]: value };
    setEquipment(newEquipment);
    
    // Validate
    const error = validateEquipment(countryId, equipmentType, value);
    const errorKey = `${equipmentType}${country}`;
    
    setErrors(prev => ({
      ...prev,
      [errorKey]: error || ''
    }));
  };

  const calculateBattle = () => {
    if (!country1 || !country2) {
      alert('لطفاً هر دو کشور را انتخاب کنید');
      return;
    }
    
    if (country1 === country2) {
      alert('نمی‌توانید یک کشور را با خودش مقایسه کنید');
      return;
    }
    
    // Check for validation errors
    const hasErrors = Object.values(errors).some(error => error !== '');
    if (hasErrors) {
      alert('لطفاً محدودیت‌های تجهیزات را رعایت کنید');
      return;
    }
    
    // Calculate scores
    const score1 = (equipment1.tanks * 10) + (equipment1.planes * 20) + (equipment1.soldiers * 1) + 
                  (equipment1.missiles * 50) + (equipment1.submarines * 40) + (equipment1.ships * 30);
    
    const score2 = (equipment2.tanks * 10) + (equipment2.planes * 20) + (equipment2.soldiers * 1) + 
                  (equipment2.missiles * 50) + (equipment2.submarines * 40) + (equipment2.ships * 30);
    
    // Calculate win chances
    let winChance1, winChance2;
    if (score1 === 0 && score2 === 0) {
      winChance1 = winChance2 = 50;
    } else {
      winChance1 = Math.round((score1 / (score1 + score2)) * 100);
      winChance2 = 100 - winChance1;
    }
    
    // Calculate damage
    const damage1 = winChance2;
    const damage2 = winChance1;
    
    // Determine battle result message
    let resultMessage, resultClass;
    if (winChance1 >= 70) {
      resultMessage = `${countryNames[country1]} با اقتدار پیروز شد! 💥`;
      resultClass = 'text-yellow-400';
    } else if (winChance2 >= 70) {
      resultMessage = `${countryNames[country2]} با اقتدار پیروز شد! 💥`;
      resultClass = 'text-orange-400';
    } else {
      resultMessage = 'نبرد نزدیک بود! ⚔️';
      resultClass = 'text-white';
    }
    
    setResults({
      message: resultMessage,
      messageClass: resultClass,
      country1Name: countryNames[country1],
      country2Name: countryNames[country2],
      winChance1,
      winChance2,
      damage1,
      damage2,
      score1,
      score2
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center space-x-2" dir="rtl">
          <Swords className="w-8 h-8 text-red-400" />
          <span>شبیه‌ساز نبرد جهانی</span>
        </h2>
        <p className="text-gray-300" dir="rtl">مقایسه قدرت نظامی کشورهای جنگ جهانی دوم</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country 1 */}
        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 text-center" dir="rtl">🏴 کشور اول</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">انتخاب کشور:</label>
              <select
                value={country1}
                onChange={(e) => setCountry1(e.target.value)}
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
                dir="rtl"
              >
                <option value="">کشور را انتخاب کنید</option>
                {countries.map(group => (
                  <optgroup key={group.group} label={`--- ${group.group} ---`}>
                    {group.countries.map(countryId => (
                      <option 
                        key={countryId} 
                        value={countryId}
                        disabled={countryId === country2}
                      >
                        {countryNames[countryId]}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.keys(equipmentNames).map(equipmentType => (
                <div key={equipmentType}>
                  <label className="block text-sm font-medium text-gray-300 mb-1" dir="rtl">
                    {equipmentNames[equipmentType as keyof typeof equipmentNames]}:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={equipment1[equipmentType as keyof Equipment]}
                    onChange={(e) => handleEquipmentChange(1, equipmentType as keyof Equipment, parseInt(e.target.value) || 0)}
                    className="w-full bg-white/10 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                    placeholder="0"
                    dir="rtl"
                  />
                  {errors[`${equipmentType}1`] && (
                    <div className="text-red-400 text-xs mt-1" dir="rtl">
                      {errors[`${equipmentType}1`]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Country 2 */}
        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 text-center" dir="rtl">🏴 کشور دوم</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">انتخاب کشور:</label>
              <select
                value={country2}
                onChange={(e) => setCountry2(e.target.value)}
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
                dir="rtl"
              >
                <option value="">کشور را انتخاب کنید</option>
                {countries.map(group => (
                  <optgroup key={group.group} label={`--- ${group.group} ---`}>
                    {group.countries.map(countryId => (
                      <option 
                        key={countryId} 
                        value={countryId}
                        disabled={countryId === country1}
                      >
                        {countryNames[countryId]}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.keys(equipmentNames).map(equipmentType => (
                <div key={equipmentType}>
                  <label className="block text-sm font-medium text-gray-300 mb-1" dir="rtl">
                    {equipmentNames[equipmentType as keyof typeof equipmentNames]}:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={equipment2[equipmentType as keyof Equipment]}
                    onChange={(e) => handleEquipmentChange(2, equipmentType as keyof Equipment, parseInt(e.target.value) || 0)}
                    className="w-full bg-white/10 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                    placeholder="0"
                    dir="rtl"
                  />
                  {errors[`${equipmentType}2`] && (
                    <div className="text-red-400 text-xs mt-1" dir="rtl">
                      {errors[`${equipmentType}2`]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <div className="text-center">
        <button
          onClick={calculateBattle}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
        >
          <Calculator className="w-5 h-5" />
          <span>💥 محاسبه نتیجه</span>
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-white/10 rounded-lg p-6 animate-fadeIn">
          <div className={`text-center text-xl font-bold mb-6 ${results.messageClass}`} dir="rtl">
            {results.message}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Country 1 Results */}
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-lg font-bold text-white mb-4 text-center" dir="rtl">
                {results.country1Name}
              </h4>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1" dir="rtl">
                    <span>شانس پیروزی:</span>
                    <span>{results.winChance1}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-4 rounded-full transition-all duration-1000 flex items-center justify-center text-xs font-bold text-black"
                      style={{ width: `${results.winChance1}%` }}
                    >
                      {results.winChance1}%
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1" dir="rtl">
                    <span>خسارت:</span>
                    <span>{results.damage1}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full transition-all duration-1000 flex items-center justify-center text-xs font-bold text-white"
                      style={{ width: `${results.damage1}%` }}
                    >
                      {results.damage1}%
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-300 mt-3">
                  امتیاز کل: {results.score1.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Country 2 Results */}
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-lg font-bold text-white mb-4 text-center" dir="rtl">
                {results.country2Name}
              </h4>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1" dir="rtl">
                    <span>شانس پیروزی:</span>
                    <span>{results.winChance2}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-4 rounded-full transition-all duration-1000 flex items-center justify-center text-xs font-bold text-black"
                      style={{ width: `${results.winChance2}%` }}
                    >
                      {results.winChance2}%
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1" dir="rtl">
                    <span>خسارت:</span>
                    <span>{results.damage2}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full transition-all duration-1000 flex items-center justify-center text-xs font-bold text-white"
                      style={{ width: `${results.damage2}%` }}
                    >
                      {results.damage2}%
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-300 mt-3">
                  امتیاز کل: {results.score2.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Scoring System Info */}
          <div className="mt-6 bg-blue-600/20 rounded-lg p-4">
            <h5 className="font-bold text-blue-400 mb-2" dir="rtl">سیستم امتیازدهی:</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-white" dir="rtl">
              <div>تانک: 10 امتیاز</div>
              <div>هواپیما: 20 امتیاز</div>
              <div>سرباز: 1 امتیاز</div>
              <div>موشک: 50 امتیاز</div>
              <div>زیردریایی: 40 امتیاز</div>
              <div>ناو جنگی: 30 امتیاز</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleSimulator;