import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { Crown, Users, Zap, Shield, Clock, ZoomIn, ZoomOut, RotateCcw, Search, List } from 'lucide-react';

const WorldMap: React.FC = () => {
  const { state, dispatch } = useGame();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [highlightedCountry, setHighlightedCountry] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCountryList, setShowCountryList] = useState(false);
  
  // Zoom and Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  const handleCountryClick = (countryId: string) => {
    const country = state.countries.find(c => c.id === countryId);
    if (!country || country.isOccupied) return;
    
    if (state.currentUser?.country) {
      alert('شما قبلاً یک کشور انتخاب کرده‌اید');
      return;
    }

    setSelectedCountry(countryId);
    setShowConfirmation(true);
  };

  const handleCountryHover = (countryId: string | null) => {
    setHighlightedCountry(countryId);
  };

  const confirmSelection = () => {
    if (selectedCountry && state.currentUser) {
      dispatch({
        type: 'SELECT_COUNTRY',
        payload: {
          userId: state.currentUser.id,
          countryId: selectedCountry
        }
      });
      setShowConfirmation(false);
      setSelectedCountry(null);
    }
  };

  const cancelSelection = () => {
    setShowConfirmation(false);
    setSelectedCountry(null);
  };

  // Zoom functions
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan functions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === mapRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const selectedCountryData = selectedCountry ? state.countries.find(c => c.id === selectedCountry) : null;

  // Check if country has shield protection
  const hasShieldProtection = (country: any) => {
    if (!country.occupiedBy) return false;
    const user = state.users.find(u => u.id === country.occupiedBy);
    if (!user || !user.countrySelectedAt) return false;
    
    const timeSinceSelection = Date.now() - new Date(user.countrySelectedAt).getTime();
    return timeSinceSelection < state.gameSettings.shieldProtectionTime;
  };

  const getShieldTimeLeft = (country: any) => {
    if (!country.occupiedBy) return 0;
    const user = state.users.find(u => u.id === country.occupiedBy);
    if (!user || !user.countrySelectedAt) return 0;
    
    const timeSinceSelection = Date.now() - new Date(user.countrySelectedAt).getTime();
    const timeLeft = state.gameSettings.shieldProtectionTime - timeSinceSelection;
    return Math.max(0, Math.ceil(timeLeft / 1000));
  };

  // Filter countries based on search
  const filteredCountries = state.countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableCountries = state.countries.filter(c => !c.isOccupied);

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white/10 rounded-xl p-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomIn}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
            title="بزرگ‌نمایی"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
            title="کوچک‌نمایی"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
            title="بازنشانی نما"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCountryList(!showCountryList)}
            className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors"
            title="فهرست کشورها"
          >
            <List className="w-4 h-4" />
          </button>
          <span className="text-white text-sm bg-black/20 px-2 py-1 rounded">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی کشور..."
              className="bg-white/10 border border-gray-600 rounded-lg pr-10 pl-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              dir="rtl"
            />
          </div>
        </div>

        {/* Map Info */}
        <div className="text-white text-sm">
          <span>کل کشورها: {state.countries.length}</span>
          <span className="mx-2">|</span>
          <span>انتخاب شده: {state.countries.filter(c => c.isOccupied).length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Map Container */}
        <div className="xl:col-span-3">
          <div 
            ref={mapRef}
            className="relative w-full h-[700px] bg-gradient-to-b from-blue-300 to-blue-100 rounded-xl overflow-hidden shadow-2xl cursor-grab"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            {/* Enhanced World Map with SVG */}
            <div
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.2s ease'
              }}
              className="w-full h-full"
            >
              <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
                {/* Ocean background */}
                <rect width="1000" height="600" fill="url(#oceanGradient)" />
                
                {/* Gradient definitions */}
                <defs>
                  <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1e40af" />
                  </linearGradient>
                  <linearGradient id="landGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>

                {/* Continents with realistic shapes */}
                {/* North America */}
                <path
                  d="M50 80 Q80 60 120 80 Q160 70 200 90 Q240 85 280 100 L270 140 Q250 160 220 150 Q180 170 140 160 Q100 150 70 130 Z"
                  fill="url(#landGradient)"
                  opacity="0.8"
                  className="continent"
                />
                
                {/* South America */}
                <path
                  d="M180 280 Q200 260 220 280 Q240 290 250 320 Q260 360 250 400 Q240 440 220 460 Q200 480 180 470 Q160 450 150 420 Q140 380 150 340 Q160 300 180 280 Z"
                  fill="url(#landGradient)"
                  opacity="0.8"
                  className="continent"
                />

                {/* Europe */}
                <path
                  d="M420 120 Q460 110 500 120 Q540 115 580 130 L570 160 Q550 170 520 165 Q480 175 450 170 Q430 160 420 140 Z"
                  fill="url(#landGradient)"
                  opacity="0.8"
                  className="continent"
                />

                {/* Africa */}
                <path
                  d="M450 200 Q480 190 510 200 Q540 210 560 240 Q570 280 560 320 Q550 360 530 390 Q510 410 480 400 Q450 390 430 360 Q420 320 430 280 Q440 240 450 200 Z"
                  fill="url(#landGradient)"
                  opacity="0.8"
                  className="continent"
                />

                {/* Asia */}
                <path
                  d="M580 100 Q650 90 720 100 Q790 95 860 110 Q900 120 920 150 L910 200 Q880 220 850 210 Q800 230 750 220 Q700 210 650 200 Q600 190 580 160 Z"
                  fill="url(#landGradient)"
                  opacity="0.8"
                  className="continent"
                />

                {/* Australia */}
                <path
                  d="M750 400 Q780 390 810 400 Q840 410 850 430 Q845 450 820 460 Q790 465 760 455 Q740 445 750 420 Z"
                  fill="url(#landGradient)"
                  opacity="0.8"
                  className="continent"
                />
              </svg>

              {/* Countries positioned with better spacing */}
              {filteredCountries.map((country) => {
                const isProtected = hasShieldProtection(country);
                const shieldTimeLeft = getShieldTimeLeft(country);
                const isHighlighted = highlightedCountry === country.id;
                const isSearchMatch = searchTerm && (
                  country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  country.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
                );
                
                return (
                  <div
                    key={country.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-10 ${
                      country.isOccupied 
                        ? isProtected 
                          ? 'opacity-75' 
                          : 'opacity-90' 
                        : 'hover:shadow-lg hover:scale-110'
                    } ${isHighlighted || isSearchMatch ? 'scale-125 z-20' : ''}`}
                    style={{
                      left: `${country.position.x}%`,
                      top: `${country.position.y}%`,
                      filter: isSearchMatch ? 'drop-shadow(0 0 10px #fbbf24)' : 'none'
                    }}
                    onClick={() => handleCountryClick(country.id)}
                    onMouseEnter={() => handleCountryHover(country.id)}
                    onMouseLeave={() => handleCountryHover(null)}
                  >
                    <div className={`relative p-3 rounded-xl border-2 shadow-xl min-w-[90px] transition-all duration-300 ${
                      country.isOccupied
                        ? isProtected
                          ? 'bg-blue-400 border-blue-600 ring-4 ring-blue-300'
                          : state.currentUser?.country === country.id
                          ? 'bg-green-500 border-green-700 ring-4 ring-green-300'
                          : 'bg-gray-400 border-gray-600'
                        : isHighlighted || isSearchMatch
                        ? 'bg-yellow-100 border-yellow-500 ring-4 ring-yellow-300'
                        : 'bg-white border-red-500 hover:bg-red-50 hover:border-red-600'
                    }`}>
                      <div className="text-2xl mb-1 text-center">{country.flag}</div>
                      <div className="text-xs font-bold text-center whitespace-nowrap text-gray-800" dir="rtl">
                        {country.name}
                      </div>
                      <div className="flex items-center justify-center mt-1 space-x-1">
                        <Zap className="w-3 h-3 text-yellow-600" />
                        <span className="text-xs font-bold text-gray-800">{country.power}</span>
                      </div>
                      
                      {/* Shield protection indicator */}
                      {isProtected && (
                        <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1">
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      {/* Shield timer */}
                      {isProtected && shieldTimeLeft > 0 && (
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1 whitespace-nowrap">
                          <Clock className="w-3 h-3" />
                          <span>{Math.floor(shieldTimeLeft / 60)}:{(shieldTimeLeft % 60).toString().padStart(2, '0')}</span>
                        </div>
                      )}
                      
                      {country.isOccupied && !isProtected && (
                        <div className="absolute -top-2 -right-2">
                          <Crown className="w-4 h-4 text-yellow-600" />
                        </div>
                      )}

                      {/* Country name tooltip on hover */}
                      {isHighlighted && (
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap z-30">
                          {country.name} ({country.nameEn})
                          <div className="text-xs opacity-75">قدرت: {country.power}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Players Count */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-200">
              <div className="flex items-center space-x-3" dir="rtl">
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-gray-600">بازیکنان فعال</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {state.users.filter(u => u.role === 'player').length} / {state.gameSettings.maxPlayers}
                  </div>
                </div>
              </div>
            </div>

            {/* Search Results */}
            {searchTerm && filteredCountries.length === 0 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg">
                کشوری با این نام یافت نشد
              </div>
            )}

            {searchTerm && filteredCountries.length > 0 && filteredCountries.length < state.countries.length && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500/90 text-white px-4 py-2 rounded-lg">
                {filteredCountries.length} کشور یافت شد
              </div>
            )}
          </div>
        </div>

        {/* Country List Panel */}
        <div className="xl:col-span-1">
          {/* Map Legend */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-200 mb-6">
            <h3 className="font-bold text-lg mb-4 text-gray-800" dir="rtl">راهنمای نقشه:</h3>
            <div className="space-y-3 text-sm" dir="rtl">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white border-2 border-red-500 rounded-lg"></div>
                <span className="text-gray-700">کشور آزاد</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-400 border-2 border-gray-600 rounded-lg"></div>
                <span className="text-gray-700">اشغال شده</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 border-2 border-green-700 rounded-lg"></div>
                <span className="text-gray-700">کشور شما</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-400 border-2 border-blue-600 rounded-lg relative">
                  <Shield className="w-4 h-4 text-white absolute -top-1 -right-1" />
                </div>
                <span className="text-gray-700">محافظت شده</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-500 rounded-lg"></div>
                <span className="text-gray-700">انتخاب شده/جستجو</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-300 text-xs text-gray-600" dir="rtl">
              <div>💡 نکات:</div>
              <div>• برای بزرگ‌نمایی از چرخ ماوس استفاده کنید</div>
              <div>• برای جابجایی نقشه را بکشید</div>
              <div>• از جستجو برای یافتن کشور استفاده کنید</div>
            </div>
          </div>

          {/* Country List */}
          {(showCountryList || !state.currentUser?.country) && (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-200">
              <h3 className="font-bold text-lg mb-4 text-gray-800" dir="rtl">
                انتخاب کشور از فهرست ({availableCountries.length} کشور آزاد)
              </h3>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {availableCountries.map((country) => (
                  <div
                    key={country.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleCountryClick(country.id)}
                  >
                    <div className="flex items-center space-x-3" dir="rtl">
                      <span className="text-2xl">{country.flag}</span>
                      <div className="flex-1">
                        <div className="font-bold text-gray-800">{country.name}</div>
                        <div className="text-sm text-gray-600">{country.nameEn}</div>
                        <div className="flex items-center space-x-1 mt-1">
                          <Zap className="w-3 h-3 text-yellow-600" />
                          <span className="text-xs font-bold text-gray-700">قدرت: {country.power}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Country Resources Preview */}
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-600 mb-1" dir="rtl">منابع اولیه:</div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div>نفت: {country.resources.oil.toLocaleString()}</div>
                        <div>غذا: {country.resources.food.toLocaleString()}</div>
                        <div>فلز: {country.resources.metals.toLocaleString()}</div>
                        <div>سرباز: {country.resources.soldiers.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && selectedCountryData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <div className="text-center">
              <div className="text-6xl mb-6">{selectedCountryData.flag}</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800" dir="rtl">
                انتخاب {selectedCountryData.name}
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed" dir="rtl">
                آیا مطمئن هستید که می‌خواهید {selectedCountryData.name} را انتخاب کنید؟ 
                این انتخاب قابل تغییر نیست و شما {Math.floor(state.gameSettings.shieldProtectionTime / 60000)} دقیقه محافظت خواهید داشت.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-xl" dir="rtl">
                  <div className="font-bold text-blue-800 text-sm">قدرت</div>
                  <div className="text-3xl font-bold text-blue-600">{selectedCountryData.power}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl" dir="rtl">
                  <div className="font-bold text-green-800 text-sm">سربازان</div>
                  <div className="text-xl font-bold text-green-600">
                    {selectedCountryData.resources.soldiers.toLocaleString()}
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl" dir="rtl">
                  <div className="font-bold text-yellow-800 text-sm">نفت</div>
                  <div className="text-xl font-bold text-yellow-600">
                    {selectedCountryData.resources.oil.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={cancelSelection}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  انصراف
                </button>
                <button
                  onClick={confirmSelection}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  تأیید انتخاب
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldMap;