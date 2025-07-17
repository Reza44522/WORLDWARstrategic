import React, { useState, useEffect } from 'react';
import { Newspaper, Filter, Clock, TrendingUp, Users, Swords, Handshake, Package, Crown, Shield } from 'lucide-react';

interface NewsItem {
  id: string;
  type: 'war' | 'alliance' | 'trade' | 'upgrade' | 'country_selection' | 'peace' | 'general';
  title: string;
  description: string;
  involvedCountries: string[];
  involvedPlayers: string[];
  timestamp: Date;
  importance: 'low' | 'medium' | 'high';
}

const NewsSection: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | NewsItem['type']>('all');

  useEffect(() => {
    const loadNews = () => {
      const savedNews = localStorage.getItem('worldWarNews');
      if (savedNews) {
        try {
          const parsedNews = JSON.parse(savedNews).map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }));
          setNews(parsedNews);
        } catch (error) {
          console.error('Error loading news:', error);
        }
      }
    };

    loadNews();
    const interval = setInterval(loadNews, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const filteredNews = news.filter(item => 
    filterType === 'all' || item.type === filterType
  ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const getNewsIcon = (type: NewsItem['type']) => {
    switch (type) {
      case 'war': return Swords;
      case 'alliance': return Users;
      case 'trade': return Package;
      case 'upgrade': return TrendingUp;
      case 'country_selection': return Crown;
      case 'peace': return Shield;
      default: return Newspaper;
    }
  };

  const getNewsColor = (type: NewsItem['type']) => {
    switch (type) {
      case 'war': return 'text-red-500 bg-red-500/20';
      case 'alliance': return 'text-purple-500 bg-purple-500/20';
      case 'trade': return 'text-green-500 bg-green-500/20';
      case 'upgrade': return 'text-blue-500 bg-blue-500/20';
      case 'country_selection': return 'text-yellow-500 bg-yellow-500/20';
      case 'peace': return 'text-cyan-500 bg-cyan-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getImportanceColor = (importance: NewsItem['importance']) => {
    switch (importance) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
    }
  };

  const newsTypes = [
    { key: 'all', label: 'همه اخبار' },
    { key: 'war', label: 'جنگ' },
    { key: 'alliance', label: 'اتحاد' },
    { key: 'trade', label: 'تجارت' },
    { key: 'upgrade', label: 'ارتقا' },
    { key: 'country_selection', label: 'انتخاب کشور' },
    { key: 'peace', label: 'صلح' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2" dir="rtl">
          <Newspaper className="w-8 h-8 text-blue-400" />
          <span>اخبار جهان</span>
        </h2>
        <div className="text-sm text-gray-300" dir="rtl">
          آخرین بروزرسانی: {new Date().toLocaleTimeString('fa-IR')}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 rounded-lg p-4">
        <div className="flex items-center space-x-4 mb-3" dir="rtl">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-white font-medium">فیلتر اخبار:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {newsTypes.map((type) => (
            <button
              key={type.key}
              onClick={() => setFilterType(type.key as any)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                filterType === type.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* News Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-red-600/20 rounded-lg p-4 text-center">
          <Swords className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-red-400">
            {news.filter(n => n.type === 'war').length}
          </div>
          <div className="text-xs text-gray-300">اخبار جنگ</div>
        </div>
        <div className="bg-purple-600/20 rounded-lg p-4 text-center">
          <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-purple-400">
            {news.filter(n => n.type === 'alliance').length}
          </div>
          <div className="text-xs text-gray-300">اخبار اتحاد</div>
        </div>
        <div className="bg-green-600/20 rounded-lg p-4 text-center">
          <Package className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-green-400">
            {news.filter(n => n.type === 'trade').length}
          </div>
          <div className="text-xs text-gray-300">اخبار تجارت</div>
        </div>
        <div className="bg-blue-600/20 rounded-lg p-4 text-center">
          <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-blue-400">
            {news.filter(n => n.type === 'upgrade').length}
          </div>
          <div className="text-xs text-gray-300">اخبار ارتقا</div>
        </div>
      </div>

      {/* News List */}
      <div className="bg-white/10 rounded-lg max-h-[600px] overflow-hidden">
        <div className="bg-white/20 p-4 border-b border-gray-600">
          <h3 className="font-bold text-white" dir="rtl">
            {filterType === 'all' ? 'تمام اخبار' : newsTypes.find(t => t.key === filterType)?.label} 
            ({filteredNews.length})
          </h3>
        </div>
        
        <div className="overflow-y-auto max-h-[500px] divide-y divide-gray-600">
          {filteredNews.map((item) => {
            const Icon = getNewsIcon(item.type);
            const colorClass = getNewsColor(item.type);
            const importanceClass = getImportanceColor(item.importance);
            
            return (
              <div
                key={item.id}
                className={`p-4 hover:bg-white/5 transition-colors border-r-4 ${importanceClass}`}
              >
                <div className="flex items-start space-x-3" dir="rtl">
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white text-sm">{item.title}</h4>
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{item.timestamp.toLocaleString('fa-IR')}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-2 leading-relaxed" dir="rtl">
                      {item.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {item.involvedPlayers.map((player, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-600/20 text-blue-400"
                        >
                          {player}
                        </span>
                      ))}
                      
                      {item.involvedCountries.map((country, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-600/20 text-green-400"
                        >
                          {country}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredNews.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p dir="rtl">
                {filterType === 'all' 
                  ? 'هنوز خبری منتشر نشده است' 
                  : `خبری در دسته‌بندی "${newsTypes.find(t => t.key === filterType)?.label}" وجود ندارد`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* News Legend */}
      <div className="bg-white/10 rounded-lg p-4">
        <h4 className="font-bold text-white mb-3" dir="rtl">راهنمای اهمیت اخبار:</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2" dir="rtl">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-white">اهمیت بالا</span>
          </div>
          <div className="flex items-center space-x-2" dir="rtl">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-white">اهمیت متوسط</span>
          </div>
          <div className="flex items-center space-x-2" dir="rtl">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-white">اهمیت کم</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsSection;